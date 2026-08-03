<template>
  <div class="position-relative bg-darkgray">
    <SharedSectionSpacer />
    <div class="container-lg">
      <v-row>
        <v-col cols="12" lg="4">
          <SharedLeftSideDarkHeading number="02" title="Our Work" />
        </v-col>
        <v-col cols="12" lg="8">
          <div class="d-flex flex-column ga-96">
            
            <SharedCommonHeading
              class="mw-md-670"
              title="Building products with Purpose."
              subtitle="We partner with startups and enterprises to design, build, and scale digital products. From early discovery to engineering execution, we deliver end-to-end solutions tailored to your business goals."
            />
            
          </div>
        </v-col>
      </v-row>
    </div>
    
    <div class="projects pt-md-95 pt-50">
      <ProjectsProjectGrid />
    </div>
    
    <SharedSectionSpacer />
  </div>
</template>