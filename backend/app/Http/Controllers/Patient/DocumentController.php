<?php

namespace App\Http\Controllers\Patient;

use App\Http\Controllers\Controller;
use App\Models\Document;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DocumentController extends Controller
{
    /**
     * List patient's documents.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Document::where('patient_id', $request->user()->id)
            ->with(['doctor', 'appointment.doctor']); // Load nested doctor if needed

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        $documents = $query->orderBy('created_at', 'desc')
            ->get(); // Simplified for now

        return response()->json($documents);
    }

    /**
     * Store a new document.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'type' => 'required|string',
            'file' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ]);

        $path = $request->file('file')->store('documents', 'public');

        $document = Document::create([
            'patient_id' => $request->user()->id,
            'title' => $request->title,
            'type' => $request->type,
            'file_path' => $path,
            'date' => now(),
        ]);

        return response()->json([
            'message' => 'Document ajouté avec succès.',
            'document' => $document,
        ], 201);
    }

    /**
     * Download a document.
     */
    public function download(Request $request, $id)
    {
        $document = Document::where('patient_id', $request->user()->id)
            ->findOrFail($id);

        if (!$document->file_path || !\Storage::disk('public')->exists($document->file_path)) {
            return response()->json(['message' => 'Fichier non trouvé.'], 404);
        }

        return \Storage::disk('public')->download($document->file_path, $document->title);
    }

    /**
     * View a single document.
     */
    public function show(Request $request, $id): JsonResponse
    {
        $document = Document::where('patient_id', $request->user()->id)
            ->with('doctor')
            ->findOrFail($id);

        return response()->json(['document' => $document]);
    }
}
