@props(['value'])

<label {{ $attributes }}>
    <span class="block text-sm font-bold uppercase text-primary/80">{{ $value ?? $slot }}</span>
</label>
