<x-guest-layout>
    <div class="container mx-auto px-4 py-8">
        <div class="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
            <div class="p-6">
                <h2 class="text-2xl font-bold mb-4">Authorization Request</h2>
                
                <p class="mb-4">
                    <strong>{{ $client->name }}</strong> is requesting permission to access your account.
                </p>

                @if(count($scopes) > 0)
                    <div class="mb-4">
                        <h3 class="font-semibold mb-2">Scopes requested:</h3>
                        <ul class="list-disc list-inside text-gray-600">
                            @foreach($scopes as $scope)
                                <li>{{ $scope->description }}</li>
                            @endforeach
                        </ul>
                    </div>
                @endif

                <div class="flex justify-end space-x-4 mt-6">
                    <form method="post" action="{{ route('passport.authorizations.deny') }}">
                        @csrf
                        @method('DELETE')
                        <input type="hidden" name="state" value="{{ $request->state }}">
                        <input type="hidden" name="client_id" value="{{ $client->id }}">
                        <input type="hidden" name="auth_token" value="{{ $authToken }}">
                        <button type="submit" class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                            Deny
                        </button>
                    </form>

                    <form method="post" action="{{ route('passport.authorizations.approve') }}">
                        @csrf
                        <input type="hidden" name="state" value="{{ $request->state }}">
                        <input type="hidden" name="client_id" value="{{ $client->id }}">
                        <input type="hidden" name="auth_token" value="{{ $authToken }}">
                        <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                            Approve
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </div>
</x-guest-layout>
