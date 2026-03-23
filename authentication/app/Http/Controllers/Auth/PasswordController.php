<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

/**
 * @group Authentication
 */
class PasswordController extends Controller
{
    /**
     * Update the authenticated user's password.
     *
     * @group Authentication
     * @subgroup Password Management
     * @authenticated
     * 
     * @bodyParam current_password string required The user's current password. Example: oldpassword123
     * @bodyParam password string required The new password. Must be confirmed. Example: newpassword123
     * @bodyParam password_confirmation string required Password confirmation. Must match password. Example: newpassword123
     * 
     * @response 302
     */
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validateWithBag('updatePassword', [
            'current_password' => ['required', 'current_password'],
            'password' => ['required', Password::defaults(), 'confirmed'],
        ]);

        $request->user()->update([
            'password' => Hash::make($validated['password']),
        ]);

        return back()->with('status', 'password-updated');
    }
}
