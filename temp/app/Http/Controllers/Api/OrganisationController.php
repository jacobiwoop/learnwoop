<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Organisation;
use Illuminate\Http\Request;

class OrganisationController extends Controller
{
    public function index()
    {
        $organisations = Organisation::all();
        return response()->json($organisations);
    }

    public function show(Organisation $organisation)
    {
        return response()->json($organisation);
    }

    public function store(Request $request)
    {
        $organisation = Organisation::create($request->all());
        return response()->json($organisation, 201);
    }

    public function update(Request $request, Organisation $organisation)
    {
        $organisation->update($request->all());
        return response()->json($organisation);
    }

    public function destroy(Organisation $organisation)
    {
        $organisation->delete();
        return response()->json(null, 204);
    }
}