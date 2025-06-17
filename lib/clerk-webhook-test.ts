// Utility for testing Clerk webhook locally
// This is not used in production, just for development/testing

export const sampleUserCreatedEvent = {
  data: {
    id: "user_test123",
    email_addresses: [
      {
        id: "email_test123",
        email_address: "test@example.com",
        verification: { status: "verified", strategy: "email_code" }
      }
    ],
    primary_email_address_id: "email_test123",
    first_name: "John",
    last_name: "Doe",
    image_url: "https://example.com/avatar.jpg",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  type: "user.created"
};

export const sampleUserUpdatedEvent = {
  data: {
    id: "user_test123",
    email_addresses: [
      {
        id: "email_test123",
        email_address: "updated@example.com",
        verification: { status: "verified", strategy: "email_code" }
      }
    ],
    primary_email_address_id: "email_test123",
    first_name: "Jane",
    last_name: "Smith",
    image_url: "https://example.com/new-avatar.jpg",
    updated_at: new Date().toISOString()
  },
  type: "user.updated"
};

export const sampleSessionCreatedEvent = {
  data: {
    id: "session_test123",
    user_id: "user_test123",
    status: "active",
    created_at: new Date().toISOString()
  },
  type: "session.created"
}; 