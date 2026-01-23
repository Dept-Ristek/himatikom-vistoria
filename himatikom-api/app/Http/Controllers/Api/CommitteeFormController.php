<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CommitteeForm;
use App\Models\CommitteeFormDivision;
use App\Models\CommitteeFormQuestion;
use App\Models\CommitteeRegistration;
use App\Models\CommitteeRegistrationAnswer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CommitteeFormController extends Controller
{
    /**
     * LIST FORMS (Untuk Admin & Members)
     */
    public function indexForms()
    {
        $forms = CommitteeForm::with('divisions', 'questions')
            ->where('status', 'active')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => true,
            'data' => $forms
        ], 200);
    }

    /**
     * GET SINGLE FORM WITH DIVISIONS & QUESTIONS
     */
    public function getForm($formId)
    {
        $form = CommitteeForm::with('divisions', 'questions')
            ->findOrFail($formId);

        return response()->json([
            'status' => true,
            'data' => $form
        ], 200);
    }

    /**
     * CREATE FORM (Hanya Pengurus)
     */
    public function createForm(Request $request)
    {
        $user = Auth::user();

        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'divisions' => 'required|array|min:1',
            'divisions.*.name' => 'required|string',
            'divisions.*.quota' => 'required|integer|min:0',
            'questions' => 'required|array|min:1',
            'questions.*.question' => 'required|string',
            'questions.*.type' => 'required|in:text,textarea,multiple_choice,radio',
            'questions.*.required' => 'required|boolean',
            'questions.*.options' => 'nullable|array',
        ]);

        // Create form
        $form = CommitteeForm::create([
            'user_id' => $user->id,
            'name' => $request->name,
            'description' => $request->description,
            'status' => 'active',
        ]);

        // Create divisions
        foreach ($request->divisions as $key => $division) {
            CommitteeFormDivision::create([
                'committee_form_id' => $form->id,
                'name' => $division['name'],
                'quota' => $division['quota'],
                'order' => $key,
            ]);
        }

        // Create questions
        foreach ($request->questions as $key => $question) {
            CommitteeFormQuestion::create([
                'committee_form_id' => $form->id,
                'question' => $question['question'],
                'type' => $question['type'],
                'options' => $question['options'] ?? null,
                'required' => $question['required'],
                'order' => $key,
            ]);
        }

        return response()->json([
            'status' => true,
            'message' => 'Form berhasil dibuat',
            'data' => $form->load('divisions', 'questions')
        ], 201);
    }

    /**
     * UPDATE FORM (Admin/Pengurus)
     */
    public function updateForm(Request $request, $formId)
    {
        $user = Auth::user();

        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'divisions' => 'required|array|min:1',
            'divisions.*.name' => 'required|string',
            'divisions.*.quota' => 'required|integer|min:0',
            'questions' => 'required|array|min:1',
            'questions.*.question' => 'required|string',
            'questions.*.type' => 'required|in:text,textarea,multiple_choice,radio',
            'questions.*.required' => 'required|boolean',
            'questions.*.options' => 'nullable|array',
        ]);

        $form = CommitteeForm::findOrFail($formId);

        // Update form
        $form->update([
            'name' => $request->name,
            'description' => $request->description,
        ]);

        // Update divisions
        CommitteeFormDivision::where('committee_form_id', $form->id)->delete();
        foreach ($request->divisions as $key => $division) {
            CommitteeFormDivision::create([
                'committee_form_id' => $form->id,
                'name' => $division['name'],
                'quota' => $division['quota'],
                'order' => $key,
            ]);
        }

        // Update questions
        CommitteeFormQuestion::where('committee_form_id', $form->id)->delete();
        foreach ($request->questions as $key => $question) {
            CommitteeFormQuestion::create([
                'committee_form_id' => $form->id,
                'question' => $question['question'],
                'type' => $question['type'],
                'options' => $question['options'] ?? null,
                'required' => $question['required'],
                'order' => $key,
            ]);
        }

        return response()->json([
            'status' => true,
            'message' => 'Form berhasil diupdate',
            'data' => $form->load('divisions', 'questions')
        ], 200);
    }

    /**
     * REGISTER / SUBMIT FORM (Untuk Members)
     * Now accepts array of divisions and creates answers only once
     */
    public function registerForm(Request $request)
    {
        $user = Auth::user();

        // Support both single division (legacy) and multiple divisions (new)
        $divisionIds = [];
        if ($request->has('division_ids')) {
            // New format: array of divisions
            $divisionIds = is_array($request->division_ids) ? $request->division_ids : [$request->division_ids];
        } else {
            // Legacy format: single division_id
            $divisionIds = [$request->division_id];
        }

        $request->validate([
            'form_id' => 'required|exists:committee_forms,id',
            'division_ids' => 'sometimes|array|min:1|max:2',
            'division_ids.*' => 'exists:committee_form_divisions,id',
            'division_id' => 'sometimes|exists:committee_form_divisions,id',
            'answers' => 'required|array',
            'answers.*.question_id' => 'required|exists:committee_form_questions,id',
            'answers.*.answer' => 'required|string',
        ]);

        // Validate: max 2 divisions
        if (count($divisionIds) > 2) {
            return response()->json([
                'status' => false,
                'message' => 'Maksimal 2 divisi per form'
            ], 400);
        }

        // Check if user already registered to this form
        $existing = CommitteeRegistration::where('user_id', $user->id)
            ->where('committee_form_id', $request->form_id)
            ->first();

        if ($existing) {
            return response()->json([
                'status' => false,
                'message' => 'Anda sudah mendaftar ke form ini'
            ], 400);
        }

        try {
            // Create ONE registration with multiple division_ids (as JSON array)
            $registration = CommitteeRegistration::create([
                'user_id' => $user->id,
                'committee_form_id' => $request->form_id,
                'committee_form_division_id' => $divisionIds[0], // Set first division for backward compatibility
                'division_ids' => json_encode($divisionIds), // Store all selected divisions as JSON
                'status' => 'pending',
            ]);

            // Create answers for this registration
            foreach ($request->answers as $answer) {
                CommitteeRegistrationAnswer::create([
                    'committee_registration_id' => $registration->id,
                    'committee_form_question_id' => $answer['question_id'],
                    'answer' => $answer['answer'],
                ]);
            }

            // Load related data
            $registration->load('user', 'division', 'answers');

            // Decode division_ids for response
            $registration->division_ids = json_decode($registration->division_ids, true);

            return response()->json([
                'status' => true,
                'message' => count($divisionIds) === 1 
                    ? 'Pendaftaran berhasil disimpan'
                    : 'Pendaftaran ke ' . count($divisionIds) . ' divisi berhasil disimpan',
                'data' => $registration
            ], 201);

        } catch (\Illuminate\Database\QueryException $e) {
            if ($e->getCode() == 23000) {
                return response()->json([
                    'status' => false,
                    'message' => 'Duplikat pendaftaran terdeteksi'
                ], 400);
            }
            throw $e;
        }
    }

    /**
     * GET REGISTRATIONS (Untuk Admin)
     */
    public function getRegistrations($formId)
    {
        $registrations = CommitteeRegistration::with('user', 'division', 'answers')
            ->where('committee_form_id', $formId)
            ->orderBy('created_at', 'desc')
            ->get();

        // Transform data to include division_ids (JSON array)
        $response = $registrations->map(function($registration) {
            $divisionIds = json_decode($registration->division_ids, true) ?? [$registration->committee_form_division_id];
            
            return [
                'id' => $registration->id,
                'user_id' => $registration->user_id,
                'user' => [
                    'id' => $registration->user->id,
                    'name' => $registration->user->name,
                    'nim' => $registration->user->nim,
                ],
                'division_id' => $registration->committee_form_division_id,
                'division' => [
                    'id' => $registration->division->id,
                    'name' => $registration->division->name,
                ],
                'division_ids' => $divisionIds, // Array of selected divisions
                'divisions' => CommitteeFormDivision::whereIn('id', $divisionIds)->get(['id', 'name'])->toArray(),
                'status' => $registration->status,
                'created_at' => $registration->created_at,
                'answers' => $registration->answers->map(function ($answer) {
                    return [
                        'id' => $answer->id,
                        'question_id' => $answer->committee_form_question_id,
                        'answer' => $answer->answer,
                    ];
                })->toArray(),
            ];
        });

        return response()->json([
            'status' => true,
            'data' => $response
        ], 200);
    }

    /**
     * UPDATE REGISTRATION STATUS
     */
    public function updateRegistrationStatus(Request $request, $registrationId)
    {
        $request->validate([
            'status' => 'required|in:pending,approved,rejected',
        ]);

        $registration = CommitteeRegistration::findOrFail($registrationId);
        $registration->update(['status' => $request->status]);

        return response()->json([
            'status' => true,
            'message' => 'Status berhasil diperbarui',
            'data' => $registration
        ], 200);
    }

    /**
     * DELETE FORM
     */
    public function deleteForm($formId)
    {
        $form = CommitteeForm::findOrFail($formId);
        $form->delete();

        return response()->json([
            'status' => true,
            'message' => 'Form berhasil dihapus'
        ], 200);
    }

    /**
     * GET MY REGISTRATIONS (Untuk Members)
     */
    public function myRegistrations()
    {
        $user = Auth::user();

        $registrations = CommitteeRegistration::where('user_id', $user->id)
            ->with('division', 'answers')
            ->orderBy('created_at', 'desc')
            ->get();

        // Transform data to include division_ids (JSON array)
        $response = $registrations->map(function($registration) {
            $divisionIds = json_decode($registration->division_ids, true) ?? [$registration->committee_form_division_id];
            
            return [
                'id' => $registration->id,
                'form_id' => $registration->committee_form_id,
                'user_id' => $registration->user_id,
                'division_id' => $registration->committee_form_division_id,
                'division_ids' => $divisionIds, // Array of selected divisions
                'divisions' => CommitteeFormDivision::whereIn('id', $divisionIds)->get(['id', 'name'])->toArray(),
                'status' => $registration->status,
                'created_at' => $registration->created_at,
                'answers' => $registration->answers->map(function ($answer) {
                    return [
                        'id' => $answer->id,
                        'question_id' => $answer->committee_form_question_id,
                        'answer' => $answer->answer,
                    ];
                })->toArray(),
            ];
        });

        return response()->json([
            'status' => true,
            'data' => $response
        ], 200);
    }

    /**
     * DELETE REGISTRATION (Untuk Admin)
     */
    public function deleteRegistration($registrationId)
    {
        $registration = CommitteeRegistration::find($registrationId);
        
        if (!$registration) {
            return response()->json([
                'status' => false,
                'message' => 'Pendaftaran tidak ditemukan atau sudah dihapus'
            ], 404);
        }
        
        // Store info for response
        $formId = $registration->committee_form_id;
        $userName = $registration->user->name;
        $divisionName = $registration->division->name;
        
        // Delete registration (answers will cascade delete)
        $registration->delete();

        return response()->json([
            'status' => true,
            'message' => 'Pendaftaran ' . $userName . ' dari divisi ' . $divisionName . ' berhasil dihapus',
            'deleted_id' => $registrationId
        ], 200);
    }
}
