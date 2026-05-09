import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebar: SidebarsConfig = {
  apisidebar: [
    {
      type: "doc",
      id: "endpoints/zvid-api",
    },
    {
      type: "category",
      label: "User",
      items: [
        {
          type: "doc",
          id: "endpoints/get-user-profile",
          label: "Get user profile",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "Credits",
      items: [
        {
          type: "doc",
          id: "endpoints/get-credit-balance",
          label: "Get credit balance",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "endpoints/get-transactions",
          label: "Get transaction history",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "endpoints/get-usage-stats",
          label: "Get usage statistics",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "API Keys",
      items: [
        {
          type: "doc",
          id: "endpoints/list-api-keys",
          label: "List API keys",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "endpoints/create-api-key",
          label: "Create API key",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "endpoints/update-api-key",
          label: "Update API key",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "endpoints/revoke-api-key",
          label: "Revoke API key",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "endpoints/get-api-key-stats",
          label: "Get API key statistics",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "Render",
      items: [
        {
          type: "doc",
          id: "endpoints/submit-render-job",
          label: "Submit render job",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "endpoints/get-render-job",
          label: "Get render job status",
          className: "api-method get",
        },
      ],
    },
  ],
};

export default sidebar.apisidebar;
