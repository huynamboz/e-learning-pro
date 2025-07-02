<script setup lang="ts">
// Using ES6 import syntax
import hljs from 'highlight.js/lib/core'
import xml from 'highlight.js/lib/languages/xml'

// Then register the languages you need
hljs.registerLanguage('xml', xml)

const buttonSize = hljs.highlight(
  `<BaseButton size="sm">
  Size sm
</BaseButton>

<BaseButton size="md">
  Size md
</BaseButton>

<BaseButton size="lg">
  Size lg
</BaseButton>
`,
  { language: 'xml' },
).value

const buttonIcon = hljs.highlight(
  `<BaseButton size="icon">
  <Icon name="solar-alt-arrow-right-outline" size="20" />
</BaseButton>

<BaseButton size="icon">
  <Icon name="solar-map-arrow-right-outline" size="20" />
</BaseButton>

<BaseButton size="icon">
  <Icon name="solar-bath-broken" size="20" />
</BaseButton>
`,
  { language: 'xml' },
).value

const buttonTextWithIcon = hljs.highlight(
  `<BaseButton>
  Back
  <Icon name="solar-alt-arrow-right-outline" size="20" />
</BaseButton>

<BaseButton>
  Login
  <Icon name="solar-login-2-linear" size="20" />
</BaseButton>

<BaseButton>
  Go bath
  <Icon name="solar-bath-broken" size="20" />
</BaseButton>
`,
  { language: 'xml' },
).value
</script>

<template>
  <div class="p-6 flex flex-col gap-5">
    <!-- Breadcrumb -->
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">
            Components
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="/components/BaseButton">
            Button
          </BreadcrumbLink>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>

    <div>
      <!-- Title -->
      <h1 class="text-3xl font-bold">
        Button
      </h1>

      <!-- Description -->
      <p class="text-sm mt-3 text-muted-foreground">
        A full collection of buttons with different styles and states.
      </p>
    </div>

    <!-- Size -->
    <Card>
      <CardHeader>
        <CardTitle>Sizes</CardTitle>
        <CardDescription>
          Different button sizes for various use cases.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs default-value="preview">
          <TabsList>
            <TabsTrigger value="preview">
              Preview
            </TabsTrigger>
            <TabsTrigger value="code">
              Code
            </TabsTrigger>
          </TabsList>
          <TabsContent value="preview">
            <div class="flex gap-4 justify-center items-center py-10">
              <BaseButton size="sm">
                Size sm
              </BaseButton>
              <BaseButton size="md">
                Size md
              </BaseButton>
              <BaseButton size="lg">
                Size lg
              </BaseButton>
            </div>
          </TabsContent>

          <TabsContent value="code">
            <BaseCodeBlock :code="buttonSize" />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>

    <!-- Icon -->
    <Card>
      <CardHeader>
        <CardTitle>Icon</CardTitle>
        <CardDescription>
          Different button sizes for various use cases.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs default-value="preview">
          <TabsList>
            <TabsTrigger value="preview">
              Preview
            </TabsTrigger>
            <TabsTrigger value="code">
              Code
            </TabsTrigger>
          </TabsList>
          <TabsContent value="preview">
            <div class="flex gap-4 justify-center items-center py-10">
              <BaseButton size="icon">
                <Icon name="solar-alt-arrow-right-outline" size="20" />
              </BaseButton>
              <BaseButton size="icon">
                <Icon name="solar-map-arrow-right-outline" size="20" />
              </BaseButton>
              <BaseButton size="icon">
                <Icon name="solar-bath-broken" size="20" />
              </BaseButton>
            </div>
          </TabsContent>

          <TabsContent value="code">
            <BaseCodeBlock :code="buttonIcon" />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>

    <!-- Text with icon -->
    <Card>
      <CardHeader>
        <CardTitle>Text with Icon</CardTitle>
        <CardDescription>
          Different button sizes for various use cases.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs default-value="preview">
          <TabsList>
            <TabsTrigger value="preview">
              Preview
            </TabsTrigger>
            <TabsTrigger value="code">
              Code
            </TabsTrigger>
          </TabsList>
          <TabsContent value="preview">
            <div class="flex gap-4 justify-center items-center py-10">
              <BaseButton>
                Back
                <Icon name="solar-alt-arrow-right-outline" size="20" />
              </BaseButton>
              <BaseButton>
                Login
                <Icon name="solar-login-2-linear" size="20" />
              </BaseButton>
              <BaseButton>
                Go bath
                <Icon name="solar-bath-broken" size="20" />
              </BaseButton>
            </div>
          </TabsContent>

          <TabsContent value="code">
            <BaseCodeBlock :code="buttonTextWithIcon" />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  </div>
</template>
