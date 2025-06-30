<script setup lang="ts">
// Using ES6 import syntax
import hljs from 'highlight.js/lib/core'
import xml from 'highlight.js/lib/languages/xml'

// Then register the languages you need
hljs.registerLanguage('xml', xml)

const highlightedCode = hljs.highlight(
  `<BaseButton size="sm" state="default">
  Size sm
</BaseButton>

<BaseButton size="md" state="default">
  Size md
</BaseButton>

<BaseButton size="lg" state="default">
  Size lg
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

    <Card>
      <CardHeader>
        <CardTitle>Button Sizes</CardTitle>
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
              <BaseButton size="sm" state="default">
                Size sm
              </BaseButton>
              <BaseButton size="md" state="default">
                Size md
              </BaseButton>
              <BaseButton size="lg" state="default">
                Size lg
              </BaseButton>
            </div>
          </TabsContent>

          <TabsContent value="code">
            <BaseCodeBlock :code="highlightedCode" />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Button Sizes</CardTitle>
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
              <BaseButton size="sm" state="default">
                Button
              </BaseButton>
              <BaseButton size="md" state="default">
                Button
              </BaseButton>
              <BaseButton size="lg" state="default">
                Button
              </BaseButton>
            </div>
          </TabsContent>

          <TabsContent value="code">
            <Card />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  </div>
</template>
