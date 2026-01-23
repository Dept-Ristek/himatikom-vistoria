<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use App\Models\User;

class AuthController extends Controller
{
    /**
     * Login User
     * Input: nim, password (dimana password = nim)
     */
    public function login(Request $request)
    {
        // 1. Validasi Input
        $request->validate([
            'nim'      => 'required|string',
            'password' => 'required|string',
        ]);

        // 2. Cek Kredensial
        // Sistem otomatis mencari user berdasarkan 'nim'
        // Lalu mencocokkan 'password' input dengan hash di database
        if (!Auth::attempt(['nim' => $request->nim, 'password' => $request->password])) {
            throw ValidationException::withMessages([
                'nim' => ['NIM atau Password salah. (Coba masukkan NIM sebagai password)'],
            ]);
        }

        // 3. Ambil User
        $user = $request->user();

        // 4. Buat Token
        $token = $user->createToken('himatikom-device')->plainTextToken;

        // 5. Response
        return response()->json([
            'status'  => true,
            'message' => 'Login berhasil',
            'data'    => [
                'user'  => $user,
                'token' => $token
            ]
        ], 200);
    }

    /**
     * Logout
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'status'  => true,
            'message' => 'Logout berhasil'
        ]);
    }

    /**
     * Get Profile (Cek siapa yang login)
     */
    public function me(Request $request)
    {
        return response()->json([
            'status' => true,
            'data'   => $request->user()
        ]);
    }

    /**
     * Update Profile (Bio, Email, Avatar)
     */
    public function profileUpdate(Request $request)
    {
        $user = $request->user();

        // Validasi
        $validated = $request->validate([
            'bio'    => 'nullable|string|max:500',
            'email'  => 'nullable|email|unique:users,email,' . $user->id,
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        // Update bio dan email
        if ($request->has('bio')) {
            $user->bio = $request->input('bio');
        }

        if ($request->has('email') && $request->input('email')) {
            $user->email = $request->input('email');
        }

        // Handle avatar upload
        if ($request->hasFile('avatar')) {
            // Hapus avatar lama jika ada
            if ($user->avatar) {
                $oldPath = str_replace('/storage/', 'public/', $user->avatar);
                if (file_exists(storage_path('app/' . $oldPath))) {
                    unlink(storage_path('app/' . $oldPath));
                }
            }

            // Upload avatar baru
            $file = $request->file('avatar');
            $filename = 'avatars/' . time() . '_' . $user->id . '.' . $file->getClientOriginalExtension();
            
            // Store the file using the public disk
            try {
                $path = \Illuminate\Support\Facades\Storage::disk('public')->putFileAs(
                    'avatars',
                    $file,
                    time() . '_' . $user->id . '.' . $file->getClientOriginalExtension()
                );
                
                if ($path) {
                    $filePath = storage_path('app/public/' . $path);
                    if (file_exists($filePath)) {
                        @chmod($filePath, 0644);
                    }
                    $user->avatar = '/storage/' . $path;
                } else {
                    throw new \Exception('Failed to upload avatar file - no path returned');
                }
            } catch (\Exception $e) {
                throw new \Exception('Avatar upload error: ' . $e->getMessage());
            }
        }

        // Simpan perubahan
        $user->save();

        return response()->json([
            'status'  => true,
            'message' => 'Profil berhasil diperbarui',
            'data'    => $user
        ], 200);
    }

    /**
     * Get all users
     */
    public function getAllUsers()
    {
        $users = User::all();
        return response()->json([
            'status' => true,
            'data' => $users
        ], 200);
    }
}