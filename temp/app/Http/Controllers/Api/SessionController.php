<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Session;
use Illuminate\Http\Request;
use App\Models\Cour;

class SessionController extends Controller
{
    public function index()
    {
        $sessions = Session::all();
        return response()->json($sessions);
    }

    public function show(Session $session)
    {
        return response()->json($session);
    }

    public function store(Request $request)
    {
        $session = Session::create($request->all());
        return response()->json($session, 201);
    }

    public function update(Request $request, Session $session)
    {
        $session->update($request->all());
        return response()->json($session);
    }

    public function destroy(Session $session)
    {
        $session->delete();
        return response()->json(null, 204);
    }

    public function forCourse($courseId)
    {
        $sessions = Session::where('cours_id', $courseId)->get();
        return response()->json($sessions);
    }
}