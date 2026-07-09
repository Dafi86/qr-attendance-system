<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;

class AnnouncementController extends Controller
{
    public function index()
    {
        if (!Schema::hasTable('announcements')) {
            return response()->json([
                'success' => true,
                'data' => $this->fallbackAnnouncements(),
            ]);
        }

        $announcements = Announcement::query()
            ->where('is_active', true)
            ->latest('published_at')
            ->latest()
            ->limit(20)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $announcements->isEmpty() ? $this->fallbackAnnouncements() : $announcements,
        ]);
    }

    public function store(Request $request)
    {
        if ($request->user() instanceof Student) {
            return response()->json([
                'success' => false,
                'message' => 'Hanya admin yang dapat membuat pemberitahuan.',
            ], 403);
        }

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:150'],
            'message' => ['required', 'string'],
        ]);

        $announcement = Announcement::create([
            'user_id' => $request->user()?->id,
            'title' => $validated['title'],
            'message' => $validated['message'],
            'is_active' => true,
            'published_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Pemberitahuan berhasil dibuat',
            'data' => $announcement,
        ], 201);
    }

    public function destroy(Request $request, Announcement $announcement)
    {
        if ($request->user() instanceof Student) {
            return response()->json([
                'success' => false,
                'message' => 'Hanya admin yang dapat menghapus pemberitahuan.',
            ], 403);
        }

        $announcement->delete();

        return response()->json([
            'success' => true,
            'message' => 'Pemberitahuan berhasil dihapus',
        ]);
    }

    private function fallbackAnnouncements(): array
    {
        return [
            [
                'id' => 'default-1',
                'title' => 'Gunakan QR resmi siswa',
                'message' => 'Scan absensi hanya memakai QR yang dibuat oleh admin sekolah.',
                'published_at' => now()->toISOString(),
            ],
            [
                'id' => 'default-2',
                'title' => 'Cek riwayat absensi',
                'message' => 'Siswa dapat memantau status masuk dan pulang melalui akun masing-masing.',
                'published_at' => now()->toISOString(),
            ],
        ];
    }
}
