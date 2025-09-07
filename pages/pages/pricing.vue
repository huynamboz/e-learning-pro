<script setup lang="ts">
const pricings = [
  {
    title: 'Free',
    description: 'Perfect for hobbyists, students, or early-stage creators.',
    price: '$0',

    features: [
      'Basic SEO tools',
      'Email marketing integration',
      'Social media sharing',
      'Basic analytics',
      'Community support',
    ],
  },
  {
    title: 'Pro',
    description: 'Ideal for professionals and businesses.',
    price: '$29',
    features: [
      'Advanced SEO tools',
      'Email marketing integration',
      'Social media sharing',
      'Advanced analytics',
      'Priority support',
    ],
    titleColor: 'white',
    backgroundImage: 'https://images.unsplash.com/photo-1735746693939-586a9d7558e1?q=80&w=2832&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  }
]
</script>

<template>
  <div class="p-8 px-12 flex flex-col gap-5">
    <!-- Breadcrumb -->
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">
            Pages
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="/pages/pricing">
            Pricing
          </BreadcrumbLink>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>

    <div>
      <!-- Title -->
      <h1 class="text-3xl font-bold">
        Pricing
      </h1>

      <!-- Description -->
      <p class="text-sm mt-3 text-muted-foreground">
        This is the pricing page where you can find various plans and their details.
      </p>
    </div>

    <!-- pricing -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
      <PricingCard
        v-for="(pricing, index) in pricings"
        :key="index"
        :title="pricing.title"
        :description="pricing.description"
        :price="pricing.price"
        :features="pricing.features"
        :backgroundImage="pricing.backgroundImage"
        :titleColor="pricing.titleColor || 'text-white'"
      />
    </div>
  </div>
</template>
