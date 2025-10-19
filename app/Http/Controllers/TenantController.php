<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\User;
use App\Models\Branch;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Log;

class TenantController extends Controller
{
    public function index()
    {
        $tenants = Tenant::all();
        return view('landlord.tenants.index', compact('tenants'));
    }

    public function create()
    {
        return view('landlord.tenants.create');
    }

    public function store(Request $request)
    {
        // Validate input
        $request->validate([
            'name' => 'required|string|max:255',
            'domain' => 'required|string|max:255|unique:tenants,domain',
            'admin_email' => 'required|email|unique:users,email',
            'admin_password' => 'required|string|min:8|confirmed',
            'branch_name' => 'required|string|max:50', // Matches branches.name
            'address' => 'nullable|string|max:500',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:50',
        ]);

        return DB::transaction(function () use ($request) {

            // Create tenant
            $tenant = Tenant::create([
                'name' => $request->name,
                'domain' => $request->domain, // e.g., tenant1.localhost
            ]);

            // Switch to tenant context
            $tenant->makeCurrent();

            // Create default branch
            $branch = Branch::create([
                'tenant_id' => $tenant->id,
                'name' => $request->name . ' Default Branch', // e.g., "Test Tenant Default Branch"
                'address' => $request->input('address', 'Default Address'), // Optional, fallback to default
                'phone' => $request->input('phone', null), // Optional
                'email' => $request->input('email', null), // Optional
            ]);

            if (!$branch) {
                Log::error('Failed to create branch for tenant: ' . $tenant->id);
                return redirect()->back()->withErrors(['branch' => 'Failed to create branch.']);
            }
            Log::info('Created branch ID: ' . $branch->id);

            // dd($tenant->id);

            // Create admin user for the tenant
            $user = User::create([
                'tenant_id' => $tenant->id,
                'branch_id' => $branch->id, // Assign branch_id
                'name' => $request->name . ' Admin',
                'email' => $request->admin_email,
                'password' => Hash::make($request->admin_password),
            ]);

            $role = Role::firstOrCreate([
                'name' => 'admin',
                'tenant_id' => $tenant->id,
                'guard_name' => 'web',
            ]);
            $user->assignRole($role);

            // Assign admin role
            // $role = Role::where(['name' => 'admin', 'tenant_id' => $tenant->id, 'guard_name' => 'web'])->first();
            // $user->assignRole($role);

            // Optional: Seed tenant-specific data
            Artisan::call('db:seed', ['--class' => 'TenantSeeder']);

            // Forget tenant context
            $tenant->forgetCurrent();

            return redirect()->route('landlord.tenants.index')
                ->with('success', "Tenant created! Access at http://{$tenant->domain}");

        }, 5); // 5 times will be retry
    }
}