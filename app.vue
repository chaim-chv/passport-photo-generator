<template>
  <UApp>
    <a
      href="https://github.com/chaim-chv/passport-photo-generator"
      target="_blank"
      rel="noopener"
      class="fixed top-0 right-0 z-50 hidden sm:block"
      aria-label="View on GitHub"
    >
      <svg
        width="64"
        height="64"
        viewBox="0 0 250 250"
        class="fill-gray-800 dark:fill-gray-200"
        style="position: absolute; top: 0; right: 0; border: 0"
      >
        <path d="M0 0l135 135h-15l-120-120v-15z" class="fill-gray-700 dark:fill-gray-400" />
        <path
          d="M250 0L0 250V235L235 0h15z"
        />
        <g transform="translate(95 95) scale(0.6)">
          <path
            class="fill-white dark:fill-gray-900"
            fill-rule="evenodd"
            d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.362 19.412-6.518 33.405-24.934 33.405-46.691C97.707 22 75.788 0 48.854 0z"
          />
        </g>
      </svg>
    </a>
    <div class="min-h-screen bg-gray-50 dark:bg-gray-950">
      <UContainer class="py-6 max-w-2xl">
        <div class="text-center mb-6">
          <h1 class="text-3xl font-bold tracking-tight">Passport Photo Generator</h1>
          <p class="text-gray-500 dark:text-gray-400 mt-1.5 text-sm">
            Create a passport-ready photo in seconds &middot; Free &middot; No upload to server
          </p>
        </div>
        <UCard>
          <PassportWizard />
        </UCard>
        <p class="text-center text-xs text-gray-400 mt-6">
          All processing happens locally in your browser. Your photos are never uploaded anywhere.
        </p>
      </UContainer>
    </div>
  </UApp>
</template>
