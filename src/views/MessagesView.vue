<template>
  <div>
    <h1 class="text-2xl font-bold mb-6 text-zinc-800 dark:text-white">Messages</h1>

    <!-- Loading state -->
    <div v-if="isLoading" class="flex justify-center items-center py-12">
      <div
        class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"
      ></div>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Conversations List -->
      <div class="bg-white dark:bg-zinc-800 rounded-xl shadow-md overflow-hidden">
        <div class="p-4 border-b border-zinc-200 dark:border-zinc-700">
          <h2 class="text-lg font-semibold text-zinc-800 dark:text-white">Conversations</h2>
        </div>

        <!-- Search conversations -->
        <div class="p-3 border-b border-zinc-200 dark:border-zinc-700">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search conversations..."
            class="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-zinc-700 text-zinc-800 dark:text-white text-sm"
          />
        </div>

        <!-- Conversations list -->
        <div class="overflow-y-auto max-h-[500px]">
          <div v-if="conversations.length === 0" class="p-6 text-center">
            <p class="text-zinc-500 dark:text-zinc-400">No conversations yet</p>
          </div>

          <div
            v-for="conversation in filteredConversations"
            :key="conversation.id"
            class="border-b border-zinc-200 dark:border-zinc-700 last:border-b-0 hover:bg-zinc-50 dark:hover:bg-zinc-700 cursor-pointer"
            :class="{
              'bg-orange-50 dark:bg-orange-900/20': selectedConversation?.id === conversation.id,
            }"
            @click="selectConversation(conversation)"
          >
            <div class="p-3 flex items-start">
              <!-- User avatar -->
              <div
                class="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-bold text-sm"
              >
                {{ getInitials(conversation.otherUser?.name || '') }}
              </div>

              <!-- Conversation details -->
              <div class="ml-3 flex-1 min-w-0">
                <div class="flex items-baseline justify-between">
                  <h3
                    class="font-medium text-zinc-800 dark:text-white truncate"
                    :class="{ 'font-bold': conversation.unread }"
                  >
                    {{ conversation.otherUser?.name || 'Unknown user' }}
                  </h3>
                  <span class="text-xs text-zinc-500 dark:text-zinc-400 ml-1 whitespace-nowrap">
                    {{ formatTime(conversation.lastMessage?.created_at) }}
                  </span>
                </div>

                <!-- Listing info -->
                <div
                  v-if="conversation.listing"
                  class="text-xs text-orange-600 dark:text-orange-400 mb-1 truncate"
                >
                  Re: {{ conversation.listing.tradeWhat }}
                </div>

                <!-- Last message preview -->
                <p
                  class="text-sm text-zinc-600 dark:text-zinc-400 truncate"
                  :class="{ 'font-semibold': conversation.unread }"
                >
                  {{ conversation.lastMessage?.text || 'No messages yet' }}
                </p>

                <!-- Unread indicator -->
                <div v-if="conversation.unread" class="mt-1 flex items-center">
                  <span class="w-2 h-2 bg-orange-500 rounded-full"></span>
                  <span class="ml-1 text-xs text-orange-600 dark:text-orange-400">New message</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Message Thread -->
      <div class="md:col-span-2">
        <div
          v-if="!selectedConversation"
          class="bg-white dark:bg-zinc-800 rounded-xl shadow-md overflow-hidden p-8 text-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-16 w-16 mx-auto text-zinc-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <h3 class="mt-4 text-lg font-medium text-zinc-800 dark:text-white">
            Select a conversation
          </h3>
          <p class="mt-2 text-zinc-600 dark:text-zinc-400">
            Choose a conversation from the list or start a new one by contacting a seller from a
            listing
          </p>
        </div>

        <!-- Message Thread Container -->
        <div
          v-else
          class="bg-white dark:bg-zinc-800 rounded-xl shadow-md overflow-hidden flex flex-col h-[calc(100vh-250px)]"
        >
          <!-- Thread Header -->
          <div
            class="p-4 border-b border-zinc-200 dark:border-zinc-700 flex items-center justify-between"
          >
            <div class="flex items-center">
              <div
                class="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-bold text-sm"
              >
                {{ getInitials(selectedConversation.otherUser?.name || '') }}
              </div>
              <div class="ml-3">
                <h2 class="text-lg font-semibold text-zinc-800 dark:text-white">
                  {{ selectedConversation.otherUser?.name || 'Unknown user' }}
                </h2>

                <!-- Listing info with link -->
                <div v-if="selectedConversation.listing" class="text-sm">
                  <router-link
                    :to="`/listing/${selectedConversation.listing.id}`"
                    class="text-orange-600 hover:text-orange-500"
                  >
                    Re: {{ selectedConversation.listing.tradeWhat }}
                  </router-link>
                </div>
              </div>
            </div>
          </div>

          <!-- Messages -->
          <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4">
            <div v-if="isLoadingMessages" class="flex justify-center py-4">
              <div
                class="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-orange-500"
              ></div>
            </div>

            <div v-else-if="messages.length === 0" class="text-center py-6">
              <p class="text-zinc-500 dark:text-zinc-400">
                No messages yet. Start the conversation!
              </p>
            </div>

            <template v-else>
              <div v-for="(message, index) in messages" :key="message.id" class="mb-4">
                <!-- Date separator -->
                <div
                  v-if="showDateSeparator(message, messages[index - 1])"
                  class="text-center mb-4"
                >
                  <span
                    class="inline-block px-3 py-1 bg-zinc-100 dark:bg-zinc-700 rounded-full text-xs text-zinc-500 dark:text-zinc-400"
                  >
                    {{ formatDate(message.created_at) }}
                  </span>
                </div>

                <!-- Message -->
                <div
                  class="flex"
                  :class="{ 'justify-end': message.from_user_id === currentUser.uid }"
                >
                  <div
                    class="max-w-[75%] rounded-lg p-3"
                    :class="
                      message.from_user_id === currentUser.uid
                        ? 'bg-orange-500 text-white'
                        : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-800 dark:text-white'
                    "
                  >
                    <p class="whitespace-pre-wrap">{{ message.text }}</p>
                    <div
                      class="text-xs mt-1"
                      :class="
                        message.from_user_id === currentUser.uid
                          ? 'text-orange-100'
                          : 'text-zinc-500 dark:text-zinc-400'
                      "
                    >
                      {{ formatMessageTime(message.created_at) }}
                      <span v-if="message.from_user_id === currentUser.uid">
                        · {{ message.read ? 'Read' : 'Delivered' }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </div>

          <!-- Message Input -->
          <div class="p-3 border-t border-zinc-200 dark:border-zinc-700">
            <form @submit.prevent="sendMessage">
              <div class="flex space-x-2">
                <textarea
                  v-model="newMessage"
                  rows="1"
                  class="flex-1 px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-zinc-700 text-zinc-800 dark:text-white resize-none"
                  placeholder="Type your message..."
                  @keydown.enter.prevent="sendMessage"
                  ref="messageInput"
                  :disabled="isSending"
                ></textarea>
                <button
                  type="submit"
                  class="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  :disabled="!newMessage.trim() || isSending"
                >
                  <span v-if="isSending">
                    <svg
                      class="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        class="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        stroke-width="4"
                      ></circle>
                      <path
                        class="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  </span>
                  <span v-else>Send</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
