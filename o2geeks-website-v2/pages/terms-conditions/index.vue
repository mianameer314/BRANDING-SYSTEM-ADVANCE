<script setup lang="ts">
import AnimatedIcon from "/images/svgs/astrisk-icon.svg";
import MainImage from "/images/background/privacy-policy.png";
</script>

<template>
  <div class="common-banner position-relative">
    <v-img :src="MainImage" cover height="650" class="w-100"></v-img>
    <div class="banner-overlay"></div>
    <div class="container-lg">
      <div class="common-banner-content">
        <div class="mw-460">
          <!-- Top row: icon + paragraph -->
          <div class="d-flex ga-6">
            <img
              :src="AnimatedIcon"
              alt="icon"
              height="44"
              width="44"
              class="icon-rotate"
            />
            <p class="text-white text-subtitle-1 mb-0">
              <span class="opacity-70">Understand the</span>
              <span class="text-primary opacity-100"> Rules & Guidelines </span>
              <span class="opacity-70">Before Using Our Services</span>
            </p>
          </div>
        </div>
        <!-- Bottom row: title + badge -->
       <div class="d-flex flex-md-row flex-column ga-5 align-md-end align-start mt-md-6 mt-3">
          <h1 class="text-white text-h1 font-weight-bold mb-0">
            Terms & Conditions
          </h1>
          <SharedBigBadge />
        </div>
      </div>
    </div>
  </div>

 <div class="bg-darkgray leagal">
    <div class="container-lg py-lg-16 py-8">
    <p class="text-subtitle-1">
      This Nuxtjs Template Terms of Service (“<span class="font-weight-bold"
        >Agreement</span
      >”) is entered into by and between Nuxtjs Template (“<span
        class="font-weight-bold"
        >Nuxtjs Template</span
      >”) and the entity or person placing an order for or accessing the
      Services (“<span class="font-weight-bold">Customer</span>”). This Agreement
      consists of the terms and conditions set forth below and any Order Form.
      The “<span class="font-weight-bold">Effective Date”</span> of this Agreement
      is the date which is the earlier of (a) Customer’s initial access to the
      Services through any online provisioning, registration or order process or
      (b) the Effective Date of the first Order Form. This Agreement will govern
      Customer’s initial purchase on the Effective Date as well as any future
      purchases made by Customer that reference this Agreement.
      Nuxtjs Template may modify this Agreement from time to time as
      permitted in Section 13.4 (Amendment).
    </p>
    <p class="mt-5 text-subtitle-1">
      Capitalized terms shall have the meanings set forth in Section 1, or in
      the section where they are first used
    </p>
    <div class="my-6">
      <h4 class="text-h4 text-dark">1. Definitions</h4>
      <ul class="mt-6 list-style-none">
        <li>
          <p class="text-subtitle-1">
            <span class="font-weight-bold">1.1 “Authorized Devices”</span> means
            those mobile, desktop, or other devices with which the Services can
            be accessed and used.
          </p>
        </li>
        <li class="mt-5">
          <p class="text-subtitle-1">
            <span class="font-weight-bold">1.2 “Content”</span> means code, content,
            fonts, graphics, designs, documents, or materials created using the
            Services by Customer and its Users or imported into the Services by
            Customer and its Users.
          </p>
        </li>
        <li class="mt-5">
          <p class="text-subtitle-1">
            <span class="font-weight-bold">1.3 “Documentation”</span> means the
            technical materials made available by Nuxtjs Template to Customer
            and/or its Users in hard copy or electronic form describing the use
            and operation of the Services.
          </p>
        </li>
        <li class="mt-5">
          <p class="text-subtitle-1">
            <span class="font-weight-bold">1.4 “Services”</span> Nuxtjs Template
            proprietary web-based products and services, along with downloadable
            desktop and mobile apps. Each Order Form will identify details of
            Customer’s Services subscription.
          </p>
        </li>
        <li class="mt-5">
          <p class="text-subtitle-1">
            <span class="font-weight-bold">1.5 “Order Form”</span> means a document
            signed by both Parties identifying the Enterprise Services to be
            made available by Nuxtjs Template pursuant to this Agreement.
          </p>
        </li>
        <li class="mt-5">
          <p class="text-subtitle-1">
            <span class="font-weight-bold">1.6 “Packages”</span>or<span
              class="font-weight-bold"
              >“Components”</span
            > means add-on modules made available within the Services. Packages
            and Components may be created by Nuxtjs Template, Customer or
            other third parties. Packages and Components created by
            Nuxtjs Template are supported as part of the Services.
            Nuxtjs Template will use reasonable efforts to support Customer’s
            use of Packages and Components created by third parties but
            disclaims all warranties as to such Packages and Components.
          </p>
        </li>
        <li class="mt-5">
          <p class="text-subtitle-1">
            <span class="font-weight-bold">1.7 “User”</span> means an employee,
            contractor or other individual associated with Customer who has been
            provisioned by Customer with access to the Services.
          </p>
        </li>
        <li class="mt-5">
          <p class="text-subtitle-1">
            <span class="font-weight-bold">1.8 “Services”</span> means
            Nuxtjs Template product, web design software, tools, along with
            downloadable desktop and mobile apps. Each Order Form will identify
            details of Customer’s subscription to the Services.
          </p>
        </li>
      </ul>
    </div>
    <div class="my-6">
      <h4 class="text-h4 text-dark">2. License and use rights</h4>
      <ul class="mt-6 list-style-none">
        <li>
          <p class="text-subtitle-1">
            <span class="font-weight-bold">2.1 Services</span> Nuxtjs Template
            hereby grants Customer a non-exclusive, non-transferable license
            during the Term (as defined in Section 12) to: (a) use the Services
            and to download and install desktop or mobile applications as
            applicable on the number and type of Authorized Devices solely for
            Customer’s internal business purposes in accordance with the
            Documentation, and/or (b) use our SaaS product, hosted systems,
            design software, tools, and build websites under the
            Nuxtjs Template.app domain.. The Services are delivered
            electronically.
          </p>
        </li>
        <li class="mt-5">
          <p class="text-subtitle-1">
            <span class="font-weight-bold">2.2 Provisioning the Services</span
            > Nuxtjs Template will provide to Customer the necessary
            passwords, security protocols, policies, network links or
            connections (“Access Protocols”) to allow Customer and its Users to
            access the Services as described herein; no other access to the
            website or servers from which the Services are delivered is
            permitted. Customer will provision its Users to access and use the
            features and functions of the Services through the Access Protocols.
            Customer may select one or more Users to act as administrators and
            control, manage and use the Services on Customer’s behalf. Customer
            shall be responsible for all acts and omissions of its Users
          </p>
        </li>
      </ul>
    </div>
  </div>
  </div>

</template>
