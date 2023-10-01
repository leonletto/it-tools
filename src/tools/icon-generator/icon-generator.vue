<script setup lang="ts">
import { ref } from 'vue';
import { resizeImage } from './icon-generator-service';
import CCard from "@/ui/c-card/c-card.vue"; // Import the service function

const selectedFile = ref<File | null>(null); // Reference for selected file
const resizedImages = ref<Blob[]>([]); // Reference for resized images
const sizes = [16, 24, 32, 48, 256]; // Sizes to which we want to resize

const handleFile = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files) {
    selectedFile.value = input.files[0];
    resizedImages.value = await resizeImage(selectedFile.value, sizes);
  }
};
const createObjectURL = (blob: Blob | null) => {
  if (blob) {
    return URL.createObjectURL(blob);
  }
  return '';
};
</script>

<template>
  <CCard>
    <!-- Input area for file -->
    <input type="file" @change="handleFile" accept="image/jpeg, image/png" />

    <!-- Display area for resized images -->
    <div v-for="(image, index) in resizedImages" :key="index">
      <img v-if="image" :src="createObjectURL(image)" :alt="'Resized to ' + sizes[index] + 'px'" />
    </div>
  </CCard>
</template>
