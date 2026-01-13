import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as aoss from "aws-cdk-lib/aws-opensearchserverless";

export class OpenSearchStack extends Stack {
  public readonly collectionArn: string;
  public readonly indexName: string;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const collectionName = "kb-vector-collection";
    this.indexName = "kb-vector-index";

    const encryptionPolicy = new aoss.CfnSecurityPolicy(this, "EncryptionPolicy", {
      name: "kb-encryption-policy",
      type: "encryption",
      policy: JSON.stringify({
        Rules: [{ ResourceType: "collection", Resource: [`collection/${collectionName}`] }],
        AWSOwnedKey: true
      })
    });

    const networkPolicy = new aoss.CfnSecurityPolicy(this, "NetworkPolicy", {
      name: "kb-network-policy",
      type: "network",
      policy: JSON.stringify([
        {
          Rules: [{ ResourceType: "collection", Resource: [`collection/${collectionName}`] }],
          AllowFromPublic: true
        }
      ])
    });

    const dataAccessPolicy = new aoss.CfnAccessPolicy(this, "DataAccessPolicy", {
      name: "kb-data-access-policy",
      type: "data",
      policy: JSON.stringify([
        {
          Rules: [
            {
              ResourceType: "collection",
              Resource: [`collection/${collectionName}`],
              Permission: ["aoss:DescribeCollectionItems", "aoss:CreateCollectionItems", "aoss:UpdateCollectionItems"]
            },
            {
              ResourceType: "index",
              Resource: [`index/${collectionName}/*`],
              Permission: ["aoss:*"]
            }
          ],
          Principal: [`arn:aws:iam::${this.account}:root`]
        }
      ])
    });

    const collection = new aoss.CfnCollection(this, "VectorCollection", {
      name: collectionName,
      type: "VECTORSEARCH"
    });

    collection.addDependency(encryptionPolicy);
    collection.addDependency(networkPolicy);
    collection.addDependency(dataAccessPolicy);

    this.collectionArn = collection.attrArn;
  }
}
