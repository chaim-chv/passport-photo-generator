<template>
  <UApp>
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
