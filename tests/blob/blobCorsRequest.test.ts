import {
  BlobServiceClient,
  newPipeline,
  StorageSharedKeyCredential
} from "@azure/storage-blob";
import * as assert from "assert";

import { configLogger } from "../../src/common/Logger";
import BlobTestServerFactory from "../BlobTestServerFactory";
import {
  EMULATOR_ACCOUNT_KEY,
  EMULATOR_ACCOUNT_NAME,
  sleep
} from "../testutils";
import OPTIONSRequestPolicyFactory from "./RequestPolicy/OPTIONSRequestPolicyFactory";
import OriginPolicyFactory from "./RequestPolicy/OriginPolicyFactory";

// Set true to enable debug log
configLogger(false);

describe("Blob Cors requests test", () => {
  const factory = new BlobTestServerFactory();
  const server = factory.createServer();

  const baseURL = `http://${server.config.host}:${server.config.port}/devstoreaccount1`;
  const serviceClient = new BlobServiceClient(
    baseURL,
    newPipeline(
      new StorageSharedKeyCredential(
        EMULATOR_ACCOUNT_NAME,
        EMULATOR_ACCOUNT_KEY
      ),
      {
        retryOptions: { maxTries: 1 }
      }
    )
  );

  before(async () => {
    await server.start();
  });

  after(async () => {
    await server.close();
    await server.clean();
  });

  it("OPTIONS request without cors rules in server should be fail @loki @sql", async () => {
    const serviceProperties = await serviceClient.getProperties();
    serviceProperties.cors = [];
    await serviceClient.setProperties(serviceProperties);

    const origin = "Origin";
    const requestMethod = "GET";

    const pipeline = newPipeline(
      new StorageSharedKeyCredential(
        EMULATOR_ACCOUNT_NAME,
        EMULATOR_ACCOUNT_KEY
      ),
      {
        retryOptions: { maxTries: 1 }
      }
    );
    pipeline.factories.unshift(
      new OPTIONSRequestPolicyFactory(origin, requestMethod)
    );
    const serviceClientforOPTIONS = new BlobServiceClient(baseURL, pipeline);

    let error;
    try {
      await serviceClientforOPTIONS.getProperties();
    } catch (err) {
      error = err;
    }

    assert.ok(error.statusCode === 403);
    assert.ok(
      error.message.includes(
        "CORS not enabled or no matching rule found for this request."
      )
    );
  });

  it("OPTIONS request should not work without matching cors rules @loki @sql", async () => {
    const serviceProperties = await serviceClient.getProperties();

    const newCORS = {
      allowedHeaders: "header",
      allowedMethods: "GET",
      allowedOrigins: "test",
      exposedHeaders: "*",
      maxAgeInSeconds: 8888
    };

    serviceProperties.cors = [newCORS];

    await serviceClient.setProperties(serviceProperties);

    await sleep(100);

    let origin = "Origin";
    let requestMethod = "GET";

    let pipeline = newPipeline(
      new StorageSharedKeyCredential(
        EMULATOR_ACCOUNT_NAME,
        EMULATOR_ACCOUNT_KEY
      ),
      {
        retryOptions: { maxTries: 1 }
      }
    );
    pipeline.factories.unshift(
      new OPTIONSRequestPolicyFactory(origin, requestMethod)
    );
    let serviceClientForOPTIONS = new BlobServiceClient(baseURL, pipeline);

    let error;
    try {
      await serviceClientForOPTIONS.getProperties();
    } catch (err) {
      error = err;
    }

    assert.ok(error.statusCode === 403);
    assert.ok(
      error.message.includes(
        "CORS not enabled or no matching rule found for this request."
      )
    );

    origin = "test";
    requestMethod = "GET";

    pipeline = newPipeline(
      new StorageSharedKeyCredential(
        EMULATOR_ACCOUNT_NAME,
        EMULATOR_ACCOUNT_KEY
      ),
      {
        retryOptions: { maxTries: 1 }
      }
    );
    pipeline.factories.unshift(
      new OPTIONSRequestPolicyFactory(origin, requestMethod)
    );
    serviceClientForOPTIONS = new BlobServiceClient(baseURL, pipeline);

    const res = await serviceClientForOPTIONS.getProperties();
    assert.ok(res._response.status === 200);
  });

  it("OPTIONS request should not work without Origin header or matching allowedOrigins @loki @sql", async () => {
    const serviceProperties = await serviceClient.getProperties();

    const newCORS = {
      allowedHeaders: "header",
      allowedMethods: "GET",
      allowedOrigins: "test",
      exposedHeaders: "*",
      maxAgeInSeconds: 8888
    };

    serviceProperties.cors = [newCORS];

    await serviceClient.setProperties(serviceProperties);

    await sleep(100);

    const origin = "Origin";
    const requestMethod = "GET";

    let pipeline = newPipeline(
      new StorageSharedKeyCredential(
        EMULATOR_ACCOUNT_NAME,
        EMULATOR_ACCOUNT_KEY
      ),
      {
        retryOptions: { maxTries: 1 }
      }
    );
    pipeline.factories.unshift(
      new OPTIONSRequestPolicyFactory(origin, requestMethod)
    );
    let serviceClientForOPTIONS = new BlobServiceClient(baseURL, pipeline);

    let error;
    try {
      await serviceClientForOPTIONS.getProperties();
    } catch (err) {
      error = err;
    }

    assert.ok(error.statusCode === 403);
    assert.ok(
      error.message.includes(
        "CORS not enabled or no matching rule found for this request."
      )
    );

    pipeline = newPipeline(
      new StorageSharedKeyCredential(
        EMULATOR_ACCOUNT_NAME,
        EMULATOR_ACCOUNT_KEY
      ),
      {
        retryOptions: { maxTries: 1 }
      }
    );
    pipeline.factories.unshift(
      new OPTIONSRequestPolicyFactory(undefined, requestMethod)
    );
    serviceClientForOPTIONS = new BlobServiceClient(baseURL, pipeline);

    try {
      await serviceClientForOPTIONS.getProperties();
    } catch (err) {
      error = err;
    }

    assert.ok(error.statusCode === 403);
    assert.ok(
      error.message.includes(
        "CORS not enabled or no matching rule found for this request."
      )
    );
  });

  it("OPTIONS request should not work without requestMethod header or matching allowedMethods @loki @sql", async () => {
    const serviceProperties = await serviceClient.getProperties();

    const newCORS = {
      allowedHeaders: "header",
      allowedMethods: "GET",
      allowedOrigins: "test",
      exposedHeaders: "*",
      maxAgeInSeconds: 8888
    };

    serviceProperties.cors = [newCORS];

    await serviceClient.setProperties(serviceProperties);

    await sleep(100);

    const origin = "test";
    const requestMethod = "PUT";

    let pipeline = newPipeline(
      new StorageSharedKeyCredential(
        EMULATOR_ACCOUNT_NAME,
        EMULATOR_ACCOUNT_KEY
      ),
      {
        retryOptions: { maxTries: 1 }
      }
    );
    pipeline.factories.unshift(
      new OPTIONSRequestPolicyFactory(origin, requestMethod)
    );
    let serviceClientForOPTIONS = new BlobServiceClient(baseURL, pipeline);

    let error;
    try {
      await serviceClientForOPTIONS.getProperties();
    } catch (err) {
      error = err;
    }

    assert.ok(error.statusCode === 403);
    assert.ok(
      error.message.includes(
        "CORS not enabled or no matching rule found for this request."
      )
    );

    pipeline = newPipeline(
      new StorageSharedKeyCredential(
        EMULATOR_ACCOUNT_NAME,
        EMULATOR_ACCOUNT_KEY
      ),
      {
        retryOptions: { maxTries: 1 }
      }
    );
    pipeline.factories.unshift(
      new OPTIONSRequestPolicyFactory(origin, undefined)
    );
    serviceClientForOPTIONS = new BlobServiceClient(baseURL, pipeline);

    try {
      await serviceClientForOPTIONS.getProperties();
    } catch (err) {
      error = err;
    }

    assert.ok(error.statusCode === 400);
    assert.ok(error.message.includes("A required CORS header is not present."));
  });

  it("OPTIONS request should check the defined requestHeaders @loki @sql", async () => {
    const serviceProperties = await serviceClient.getProperties();

    const newCORS = [
      {
        allowedHeaders: "header",
        allowedMethods: "GET",
        allowedOrigins: "test",
        exposedHeaders: "*",
        maxAgeInSeconds: 8888
      },
      {
        allowedHeaders: "*",
        allowedMethods: "PUT",
        allowedOrigins: "test",
        exposedHeaders: "*",
        maxAgeInSeconds: 8888
      },
      {
        allowedHeaders: "head*",
        allowedMethods: "POST",
        allowedOrigins: "test",
        exposedHeaders: "*",
        maxAgeInSeconds: 8888
      }
    ];

    serviceProperties.cors = newCORS;

    await serviceClient.setProperties(serviceProperties);

    await sleep(100);

    // No match
    let origin = "test";
    let requestMethod = "GET";
    let reqestHeaders = "head";

    let pipeline = newPipeline(
      new StorageSharedKeyCredential(
        EMULATOR_ACCOUNT_NAME,
        EMULATOR_ACCOUNT_KEY
      ),
      {
        retryOptions: { maxTries: 1 }
      }
    );
    pipeline.factories.unshift(
      new OPTIONSRequestPolicyFactory(origin, requestMethod, reqestHeaders)
    );
    let serviceClientForOPTIONS = new BlobServiceClient(baseURL, pipeline);

    let error;
    try {
      await serviceClientForOPTIONS.getProperties();
    } catch (err) {
      error = err;
    }

    assert.ok(error.statusCode === 403);
    assert.ok(
      error.message.includes(
        "CORS not enabled or no matching rule found for this request."
      )
    );

    // Match first cors.
    origin = "test";
    requestMethod = "GET";
    reqestHeaders = "header";

    pipeline = newPipeline(
      new StorageSharedKeyCredential(
        EMULATOR_ACCOUNT_NAME,
        EMULATOR_ACCOUNT_KEY
      ),
      {
        retryOptions: { maxTries: 1 }
      }
    );
    pipeline.factories.unshift(
      new OPTIONSRequestPolicyFactory(origin, requestMethod, reqestHeaders)
    );
    serviceClientForOPTIONS = new BlobServiceClient(baseURL, pipeline);

    let res = await serviceClientForOPTIONS.getProperties();
    assert.ok(res._response.status === 200);

    // Match second cors.
    origin = "test";
    requestMethod = "PUT";
    reqestHeaders = "head";

    pipeline = newPipeline(
      new StorageSharedKeyCredential(
        EMULATOR_ACCOUNT_NAME,
        EMULATOR_ACCOUNT_KEY
      ),
      {
        retryOptions: { maxTries: 1 }
      }
    );
    pipeline.factories.unshift(
      new OPTIONSRequestPolicyFactory(origin, requestMethod, reqestHeaders)
    );
    serviceClientForOPTIONS = new BlobServiceClient(baseURL, pipeline);

    res = await serviceClientForOPTIONS.getProperties();
    assert.ok(res._response.status === 200);

    // No match.
    origin = "test";
    requestMethod = "POST";
    reqestHeaders = "hea";

    pipeline = newPipeline(
      new StorageSharedKeyCredential(
        EMULATOR_ACCOUNT_NAME,
        EMULATOR_ACCOUNT_KEY
      ),
      {
        retryOptions: { maxTries: 1 }
      }
    );
    pipeline.factories.unshift(
      new OPTIONSRequestPolicyFactory(origin, requestMethod, reqestHeaders)
    );
    serviceClientForOPTIONS = new BlobServiceClient(baseURL, pipeline);

    error;
    try {
      await serviceClientForOPTIONS.getProperties();
    } catch (err) {
      error = err;
    }

    assert.ok(error.statusCode === 403);
    assert.ok(
      error.message.includes(
        "CORS not enabled or no matching rule found for this request."
      )
    );

    // Match third cors.
    origin = "test";
    requestMethod = "POST";
    reqestHeaders = "headerheader";

    pipeline = newPipeline(
      new StorageSharedKeyCredential(
        EMULATOR_ACCOUNT_NAME,
        EMULATOR_ACCOUNT_KEY
      ),
      {
        retryOptions: { maxTries: 1 }
      }
    );
    pipeline.factories.unshift(
      new OPTIONSRequestPolicyFactory(origin, requestMethod, reqestHeaders)
    );
    serviceClientForOPTIONS = new BlobServiceClient(baseURL, pipeline);

    res = await serviceClientForOPTIONS.getProperties();
    assert.ok(res._response.status === 200);
  });

  it("OPTIONS request should work with matching rule containing Origion * @loki @sql", async () => {
    const serviceProperties = await serviceClient.getProperties();

    const newCORS = {
      allowedHeaders: "header",
      allowedMethods: "GET",
      allowedOrigins: "*",
      exposedHeaders: "*",
      maxAgeInSeconds: 8888
    };

    serviceProperties.cors = [newCORS];

    await serviceClient.setProperties(serviceProperties);

    await sleep(100);

    const origin = "anyOrigin";
    const requestMethod = "GET";

    const pipeline = newPipeline(
      new StorageSharedKeyCredential(
        EMULATOR_ACCOUNT_NAME,
        EMULATOR_ACCOUNT_KEY
      ),
      {
        retryOptions: { maxTries: 1 }
      }
    );
    pipeline.factories.unshift(
      new OPTIONSRequestPolicyFactory(origin, requestMethod)
    );
    const serviceClientForOPTIONS = new BlobServiceClient(baseURL, pipeline);

    const res = await serviceClientForOPTIONS.getProperties();
    assert.ok(res._response.status === 200);
  });

  it("Response of request to service without cors rules should not contains cors info @loki @sql", async () => {
    const serviceProperties = await serviceClient.getProperties();

    serviceProperties.cors = [];

    await serviceClient.setProperties(serviceProperties);

    await sleep(100);

    const origin = "anyOrigin";
    const pipeline = newPipeline(
      new StorageSharedKeyCredential(
        EMULATOR_ACCOUNT_NAME,
        EMULATOR_ACCOUNT_KEY
      ),
      {
        retryOptions: { maxTries: 1 }
      }
    );
    pipeline.factories.unshift(new OriginPolicyFactory(origin));
    const serviceClientWithOrigin = new BlobServiceClient(baseURL, pipeline);

    const res: any = await serviceClientWithOrigin.getProperties();

    assert.ok(res["access-control-allow-origin"] === undefined);
    assert.ok(res["access-control-expose-headers"] === undefined);
    assert.ok(res.vary === undefined);
  });

  it("Service with mismatching cors rules should response header Vary @loki @sql", async () => {
    const serviceProperties = await serviceClient.getProperties();

    const newCORS = {
      allowedHeaders: "header",
      allowedMethods: "GET",
      allowedOrigins: "test",
      exposedHeaders: "*",
      maxAgeInSeconds: 8888
    };

    serviceProperties.cors = [newCORS];

    await serviceClient.setProperties(serviceProperties);

    await sleep(100);

    const origin = "anyOrigin";
    const pipeline = newPipeline(
      new StorageSharedKeyCredential(
        EMULATOR_ACCOUNT_NAME,
        EMULATOR_ACCOUNT_KEY
      ),
      {
        retryOptions: { maxTries: 1 }
      }
    );
    pipeline.factories.unshift(new OriginPolicyFactory(origin));
    const serviceClientWithOrigin = new BlobServiceClient(baseURL, pipeline);

    let res: any = await serviceClientWithOrigin.getProperties();
    assert.ok(res.vary !== undefined);

    res = await serviceClient.getProperties();
    assert.ok(res.vary === undefined);
  });

  it("Request Match rule exists that allows all origins (*) @loki @sql", async () => {
    const serviceProperties = await serviceClient.getProperties();

    const newCORS = {
      allowedHeaders: "header",
      allowedMethods: "GET",
      allowedOrigins: "*",
      exposedHeaders: "*",
      maxAgeInSeconds: 8888
    };

    serviceProperties.cors = [newCORS];

    await serviceClient.setProperties(serviceProperties);

    await sleep(100);

    const origin = "anyOrigin";
    const pipeline = newPipeline(
      new StorageSharedKeyCredential(
        EMULATOR_ACCOUNT_NAME,
        EMULATOR_ACCOUNT_KEY
      ),
      {
        retryOptions: { maxTries: 1 }
      }
    );
    pipeline.factories.unshift(new OriginPolicyFactory(origin));
    const serviceClientWithOrigin = new BlobServiceClient(baseURL, pipeline);

    let res: any = await serviceClientWithOrigin.getProperties();
    assert.ok(res["access-control-allow-origin"] === "*");
    assert.ok(res.vary === undefined);
    assert.ok(res["access-control-expose-headers"] !== undefined);

    res = await serviceClient.getProperties();
    assert.ok(res["access-control-allow-origin"] === undefined);
    assert.ok(res.vary === undefined);
    assert.ok(res["access-control-expose-headers"] === undefined);
  });

  it("Request Match rule exists for exact origin @loki @sql", async () => {
    const serviceProperties = await serviceClient.getProperties();

    const newCORS = {
      allowedHeaders: "header",
      allowedMethods: "GET",
      allowedOrigins: "exactOrigin",
      exposedHeaders: "*",
      maxAgeInSeconds: 8888
    };

    serviceProperties.cors = [newCORS];

    await serviceClient.setProperties(serviceProperties);

    await sleep(100);

    const origin = "exactOrigin";
    const pipeline = newPipeline(
      new StorageSharedKeyCredential(
        EMULATOR_ACCOUNT_NAME,
        EMULATOR_ACCOUNT_KEY
      ),
      {
        retryOptions: { maxTries: 1 }
      }
    );
    pipeline.factories.unshift(new OriginPolicyFactory(origin));
    const serviceClientWithOrigin = new BlobServiceClient(baseURL, pipeline);

    const res: any = await serviceClientWithOrigin.getProperties();
    assert.ok(res["access-control-allow-origin"] === origin);
    assert.ok(res.vary !== undefined);
    assert.ok(res["access-control-expose-headers"] !== undefined);
  });

  it("Requests with error response should apply for CORS @loki @sql", async () => {
    const serviceProperties = await serviceClient.getProperties();

    const newCORS = {
      allowedHeaders: "header",
      allowedMethods: "GET",
      allowedOrigins: "exactOrigin",
      exposedHeaders: "*",
      maxAgeInSeconds: 8888
    };

    serviceProperties.cors = [newCORS];

    await serviceClient.setProperties(serviceProperties);

    await sleep(100);

    const origin = "exactOrigin";
    const pipeline = newPipeline(
      new StorageSharedKeyCredential(
        EMULATOR_ACCOUNT_NAME,
        EMULATOR_ACCOUNT_KEY
      ),
      {
        retryOptions: { maxTries: 1 }
      }
    );
    pipeline.factories.unshift(new OriginPolicyFactory(origin));
    const serviceClientWithOrigin = new BlobServiceClient(baseURL, pipeline);

    const containerClientwithOrigin = serviceClientWithOrigin.getContainerClient(
      "notexistcontainer"
    );

    try {
      await containerClientwithOrigin.getProperties();
    } catch (err) {
      assert.ok(
        err.response.headers._headersMap["access-control-allow-origin"]
          .value === origin
      );
      assert.ok(err.response.headers._headersMap.vary !== undefined);
      assert.ok(
        err.response.headers._headersMap["access-control-expose-headers"] !==
          undefined
      );
    }
  });

  it("Request Match rule in sequence @loki @sql", async () => {
    const serviceProperties = await serviceClient.getProperties();

    const newCORS = [
      {
        allowedHeaders: "header",
        allowedMethods: "GET",
        allowedOrigins: "exactOrigin",
        exposedHeaders: "*",
        maxAgeInSeconds: 8888
      },
      {
        allowedHeaders: "header",
        allowedMethods: "GET",
        allowedOrigins: "*",
        exposedHeaders: "*",
        maxAgeInSeconds: 8888
      }
    ];

    serviceProperties.cors = newCORS;

    await serviceClient.setProperties(serviceProperties);

    await sleep(100);

    const origin = "exactOrigin";
    const pipeline = newPipeline(
      new StorageSharedKeyCredential(
        EMULATOR_ACCOUNT_NAME,
        EMULATOR_ACCOUNT_KEY
      ),
      {
        retryOptions: { maxTries: 1 }
      }
    );
    pipeline.factories.unshift(new OriginPolicyFactory(origin));
    const serviceClientWithOrigin = new BlobServiceClient(baseURL, pipeline);

    const res: any = await serviceClientWithOrigin.getProperties();
    assert.ok(res["access-control-allow-origin"] === origin);
    assert.ok(res.vary !== undefined);
    assert.ok(res["access-control-expose-headers"] !== undefined);
  });
});
