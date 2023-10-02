<script setup lang="ts">
import { ref } from 'vue';
import { generateTextIcons, resizeImage } from "./icon-generator-service";
import CCard from "@/ui/c-card/c-card.vue";
import CInputText from "@/ui/c-input-text/c-input-text.vue"; // Import the service function

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

const textInput = ref('L'); // Reference for text input
const textFont = ref('128px Arial Black'); // Reference for font
const textIcons = ref<Blob[]>([]); // Reference for text icons

const generateIcons = async () => {
  textIcons.value = await generateTextIcons(textInput.value, textFont.value, sizes);
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

    <!-- Input area for text -->
    <CInputText v-model:value="textInput" placeholder="Enter your text here..." />

    <!-- Input area for font -->
    <CInputText v-model:value="textFont" placeholder="Enter your font here..." />

    <!-- Generate button -->
    <button @click="generateIcons">Generate</button>

    <!-- Display area for text icons -->
    <div v-for="(image, index) in textIcons" :key="'text-' + index">
      <img v-if="image" :src="createObjectURL(image)" :alt="'Text icon resized to ' + sizes[index] + 'px'" />
    </div>
  </CCard>
</template>
