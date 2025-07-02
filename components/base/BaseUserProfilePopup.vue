<script setup lang="ts">
const profileOptions = [
  {
    title: 'Profile',
    options: [
      { icon: 'solar-user-linear', name: 'Settings', link: '/settings' },
      { icon: 'solar-feed-linear', name: 'Account', link: '/account' },

      { icon: 'solar-settings-linear', name: 'Privacy', link: '/privacy' },
    ],
  },
  {
    title: 'Actions',
    options: [
      { icon: 'solar-bell-linear', name: 'Notifications', link: '/notifications' },
      { icon: 'solar-logout-linear', name: 'Logout', link: '/logout' },
    ],
  },
]
</script>

<template>
  <Popover>
    <PopoverTrigger as-child>
      <BaseAvatar
        class="cursor-pointer"
        src="https://avataaars.io/?avatarStyle=Circle&topType=LongHairStraight&accessoriesType=Blank&hairColor=BrownDark&facialHairType=Blank&clotheType=BlazerShirt&eyeType=Default&eyebrowType=Default&mouthType=Default&skinColor=Light"
      />
    </PopoverTrigger>
    <PopoverContent class="w-fit border-0 p-3 shadow-none bg-transparent">
      <div class="border-[1px] bg-shade-1 shadow-none w-[221px] p-0 rounded-[20px]" style="box-shadow: var(--popover-box-shadow);">
        <div
          v-for="(option, index) in profileOptions" :key="index" :class="{
            'border-b border-shade-3': index < profileOptions.length - 1,
          }"
        >
          <ul class="p-2 ">
            <li v-for="(item, itemIndex) in option.options" :key="itemIndex" class="hover:bg-shade-3 font-medium rounded-[12px] cursor-pointer flex items-center gap-3 p-2">
              <div class="flex items-center justify-center size-6">
                <Icon :name="item.icon" class="text-[20px] text-shade-9" />
              </div>
              <NuxtLink
                :to="item.link"
                class="text-sm text-shade-9 hover:text-primary transition-colors"
              >
                {{ item.name }}
              </NuxtLink>
            </li>
          </ul>
        </div>
      </div>
    </PopoverContent>
  </Popover>
</template>
