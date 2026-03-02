<template>
  <div class="login-character-container">
    <svg 
      class="character-svg"
      viewBox="0 0 400 400" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <!-- Purple Character -->
      <g>
        <polygon points="90,80 230,80 200,380 50,380" fill="#7A4CFF" />
        <g :class="{ 'shake': isSad }" style="transform-origin: 140px 120px;">
          <g :style="{ transform: `translate(${eyeOffset.x}px, ${eyeOffset.y}px)` }">
            <!-- Left Eye -->
            <circle cx="140" cy="110" r="8" fill="white" />
            <circle cx="140" cy="110" r="3" fill="#252429" />
            <!-- Right Eye -->
            <circle cx="180" cy="110" r="8" fill="white" />
            <circle cx="180" cy="110" r="3" fill="#252429" />
          </g>
          <!-- Mouth -->
          <path 
            :d="isSad ? 'M 150 145 Q 160 135 170 145' : isLoading ? 'M 152 140 Q 160 145 168 140' : 'M 155 140 L 165 140'" 
            stroke="#252429" stroke-width="4" stroke-linecap="round" fill="none"
            class="mouth-transition"
          />
        </g>
      </g>

      <!-- Black Character -->
      <g>
        <rect x="180" y="200" width="70" height="180" fill="#252429" />
        <g :class="{ 'shake': isSad }" style="transform-origin: 215px 240px; animation-delay: 0.1s;">
          <g :style="{ transform: `translate(${eyeOffset.x}px, ${eyeOffset.y}px)` }">
            <!-- Left Eye -->
            <circle cx="205" cy="235" r="7" fill="white" />
            <circle cx="205" cy="235" r="3" fill="black" />
            <!-- Right Eye -->
            <circle cx="230" cy="230" r="7" fill="white" />
            <circle cx="230" cy="230" r="3" fill="black" />
          </g>
          <!-- Mouth -->
          <path 
            v-if="isSad"
            d="M 205 255 Q 215 245 225 255" 
            stroke="white" stroke-width="3" stroke-linecap="round" fill="none"
            class="mouth-transition"
          />
          <path 
            v-else-if="isLoading"
            d="M 205 255 Q 215 260 225 255" 
            stroke="white" stroke-width="3" stroke-linecap="round" fill="none"
            class="mouth-transition"
          />
          <circle v-else cx="215" cy="255" r="0" fill="transparent" />
        </g>
      </g>

      <!-- Yellow Character -->
      <g>
        <path d="M 240 380 L 240 260 A 40 40 0 0 1 320 260 L 320 380 Z" fill="#F1C232" />
        <g :class="{ 'shake': isSad }" style="transform-origin: 280px 255px; animation-delay: 0.2s;">
          <!-- Eye -->
          <circle :cx="285 + eyeOffset.x" :cy="245 + eyeOffset.y" r="4" fill="#252429" />
          <!-- Mouth -->
          <path 
            :d="isSad ? 'M 270 270 Q 285 260 300 270' : isLoading ? 'M 275 265 Q 285 275 295 265' : 'M 265 265 L 295 265'" 
            stroke="#252429" stroke-width="4" stroke-linecap="round" fill="none"
            class="mouth-transition"
          />
        </g>
      </g>

      <!-- Orange Character -->
      <g>
        <path d="M 30 380 A 120 120 0 0 1 270 380 Z" fill="#FF8C42" />
        <g :class="{ 'shake': isSad }" style="transform-origin: 150px 300px; animation-delay: 0.15s;">
          <!-- Left Eye -->
          <circle :cx="110 + eyeOffset.x" :cy="290 + eyeOffset.y" r="5" fill="#252429" />
          <!-- Right Eye -->
          <circle :cx="160 + eyeOffset.x" :cy="290 + eyeOffset.y" r="5" fill="#252429" />
          <!-- Mouth -->
          <path 
            :d="isSad ? 'M 125 320 Q 135 310 145 320' : isLoading ? 'M 125 312 Q 135 325 145 312' : 'M 125 310 Q 135 320 145 310'" 
            stroke="#252429" stroke-width="5" stroke-linecap="round" fill="none"
            class="mouth-transition"
          />
        </g>
      </g>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  mouseX: {
    type: Number,
    default: window.innerWidth / 2,
  },
  mouseY: {
    type: Number,
    default: window.innerHeight / 2,
  },
  isLookingAtPassword: {
    type: Boolean,
    default: false,
  },
  isSad: {
    type: Boolean,
    default: false,
  },
  isLoading: {
    type: Boolean,
    default: false,
  }
});

const maxMove = 6;

const eyeOffset = computed(() => {
  if (props.isLookingAtPassword) {
    // Look left when showing password
    return { x: -maxMove * 1.5, y: 0 };
  }
  
  // Calculate normalized mouse position (-1 to 1)
  const nx = (props.mouseX / window.innerWidth) * 2 - 1;
  const ny = (props.mouseY / window.innerHeight) * 2 - 1;
  
  return {
    x: nx * maxMove,
    y: ny * maxMove,
  };
});
</script>

<style scoped lang="scss">
.login-character-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.character-svg {
  width: 100%;
  max-width: 400px;
  height: auto;
  overflow: visible;
}

.mouth-transition {
  transition: d 0.3s ease;
}

.shake {
  animation: head-shake 0.8s ease-in-out infinite;
}

@keyframes head-shake {
  0% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(-3deg);
  }
  75% {
    transform: rotate(3deg);
  }
  100% {
    transform: rotate(0deg);
  }
}
</style>
