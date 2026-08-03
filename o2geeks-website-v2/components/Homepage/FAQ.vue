<script setup>
import { ref } from "vue";
import { Icon } from '@iconify/vue';
const faqItems = ref([
  {
    question: "What services does your agency offer?",
    answer:
      "Yes, we provide post-launch support to ensure smooth implementation and offer ongoing maintenance packages for clients needing regular updates or technical assistance.",
  },
  {
    question: "How long does a typical project take?",
    answer:
      "Yes, we provide post-launch support to ensure smooth implementation and offer ongoing maintenance packages for clients needing regular updates or technical assistance.",
  },
  {
    question: "Do you offer custom designs, or do you use templates?",
    answer:
      "Yes, we provide post-launch support to ensure smooth implementation and offer ongoing maintenance packages for clients needing regular updates or technical assistance.",
  },
  {
    question: "What’s the cost of a project?",
    answer:
      "Yes, we provide post-launch support to ensure smooth implementation and offer ongoing maintenance packages for clients needing regular updates or technical assistance.",
  },
  {
    question: "Do you provide ongoing support after project completion?",
    answer:
      "Yes, we provide post-launch support to ensure smooth implementation and offer ongoing maintenance packages for clients needing regular updates or technical assistance.",
  },
]);
</script>

<template>
  <div class="faq bg-darkgray">
  <SharedSectionSpacer />
  <div class="container-lg">
    <v-row>
      <v-col cols="12" lg="4">
        <SharedLeftSideDarkHeading number="08" title="FAQs" />
      </v-col>
      <v-col cols="12" lg="8">
        <div class="d-flex flex-column ga-11">
          <SharedCommonHeading
            class="mw-670"
            title="Frequently asked questions"
            subtitle="Discover how we tailor our solutions to meet unique needs, delivering impactful strategies, personalized branding, and exceptional customer experiences."
          />
        </div>

        <div class="mt-lg-16 mt-8">
          <v-expansion-panels
            variant="accordion"
            elevation="0"
            class="faq-panels"
          >
            <v-expansion-panel v-for="(item, i) in faqItems" :key="i">
              <v-expansion-panel-title
                expand-icon="mdi-plus"
                collapse-icon="mdi-close"
                class="faq-title px-0 "
              >
                <span class="text-h4">{{ item.question }}</span>
              </v-expansion-panel-title>

              <v-expansion-panel-text class="faq-text text-body-1 px-0">
                {{ item.answer }}
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </div>
      </v-col>
    </v-row>
  </div>
  <SharedSectionSpacer />
  </div>
</template>
