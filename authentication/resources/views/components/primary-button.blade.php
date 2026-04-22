<button {{ $attributes->merge(['type' => 'submit', 'class' => 'inline-flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-primary to-primary-container py-4 font-headline text-base font-black tracking-tight text-on-primary-fixed shadow-[0_0_20px_rgba(34,218,255,0.20)] transition-all hover:brightness-110 active:scale-[0.98] cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none']) }}>
    {{ $slot }}
</button>
