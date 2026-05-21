<?php

namespace App\Http\Controllers;

use App\Models\Cour;
use App\Models\CourHoraire;
use App\Models\Session;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Agence104\LiveKit\AccessToken;
use Agence104\LiveKit\AccessTokenOptions;
use Agence104\LiveKit\VideoGrant;
use Illuminate\Support\Facades\DB;

class LiveKitController extends Controller
{
    /**
     * Generate an access token for LiveKit Cloud based on active schedule.
     */
    public function getToken(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['error' => 'Non authentifié'], 401);
        }

        $apiKey = env('LIVEKIT_API_KEY');
        $apiSecret = env('LIVEKIT_API_SECRET');
        $liveKitUrl = env('LIVEKIT_URL');

        if (!$apiKey || !$apiSecret) {
            return response()->json(['error' => 'LiveKit non configuré sur le serveur'], 500);
        }

        $now = Carbon::now('UTC');
        $currentDayOfWeek = $now->dayOfWeek;
        $currentTime = $now->toTimeString();

        $coursIds = $user->role === 'prof' 
            ? $user->coursEnseignes()->pluck('id')
            : $user->inscriptions()->pluck('cours_id');

        $marginStart = Carbon::now('UTC')->subMinutes(10);
        $marginEnd = Carbon::now('UTC')->addMinutes(10);

        $isSqlite = DB::connection()->getDriverName() === 'sqlite';

        $sessionQuery = Session::whereIn('cours_id', $coursIds)
            ->where('type', 'live')
            ->where('date_heure', '<=', $marginEnd);

        if ($isSqlite) {
            $sessionQuery->whereRaw("datetime(date_heure, '+' || duree_minutes || ' minute') >= ?", [$marginStart->toDateTimeString()]);
        } else {
            $sessionQuery->whereRaw("DATE_ADD(date_heure, INTERVAL duree_minutes MINUTE) >= ?", [$marginStart->toDateTimeString()]);
        }

        $session = $sessionQuery->first();

        $horaire = null;

        if (!$session) {
            $currentTimeParsed = Carbon::parse($currentTime, 'UTC');
            $horaire = CourHoraire::whereIn('cour_id', $coursIds)
                ->where('jour_semaine', $currentDayOfWeek)
                ->where('heure_debut', '<=', $currentTimeParsed->copy()->addMinutes(10)->toTimeString())
                ->where('heure_fin', '>=', $currentTimeParsed->copy()->subMinutes(10)->toTimeString())
                ->first();
        }

        if (!$session && !$horaire) {
            return response()->json(['error' => 'Aucun cours en direct n\'est planifié en ce moment.'], 404);
        }

        $cour = $session ? $session->cour : $horaire->cour;
        $roomName = $session 
            ? 'session_' . $session->id 
            : 'course_' . $cour->id . '_' . $now->format('Y_m_d');

        $identity = 'user_' . $user->id;
        $participantName = $user->prenom . ' ' . $user->nom;

        $videoGrant = (new VideoGrant())
            ->setRoomJoin()
            ->setRoomName($roomName);

        if ($user->role === 'prof') {
            $videoGrant->setRoomAdmin(true);
        } else {
            $videoGrant->setRoomAdmin(false);
        }

        $metadata = json_encode([
            'user_id' => $user->id,
            'name' => $participantName,
            'role' => $user->role,
            'avatar_url' => $user->avatar_url
        ]);

        $tokenOptions = (new AccessTokenOptions())
            ->setIdentity($identity)
            ->setName($participantName)
            ->setMetadata($metadata);

        $accessToken = new AccessToken($apiKey, $apiSecret);
        $token = $accessToken
            ->init($tokenOptions)
            ->setGrant($videoGrant)
            ->toJwt();

        return response()->json([
            'token' => $token,
            'url' => $liveKitUrl,
            'room' => $roomName,
        ]);
    }
}
