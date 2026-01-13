import { Stack, StackProps, CfnOutput } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as bedrock from "aws-cdk-lib/aws-bedrock";

interface BedrockKbStackProps extends StackProps {
  bucket: s3.IBucket;
  collectionArn: string;
  indexName: string;
  kbRoleArn: string;
}

export class BedrockKbStack extends Stack {
  public readonly knowledgeBaseId: string;

  constructor(scope: Construct, id: string, props: BedrockKbStackProps) {
    super(scope, id, props);

    const embeddingsModelArn = `arn:aws:bedrock:${this.region}::foundation-model/amazon.titan-embed-text-v2:0`;

    const kb = new bedrock.CfnKnowledgeBase(this, "KnowledgeBase", {
      name: "kb-from-s3",
      roleArn: props.kbRoleArn,
      knowledgeBaseConfiguration: {
        type: "VECTOR",
        vectorKnowledgeBaseConfiguration: {
          embeddingModelArn: embeddingsModelArn
        }
      },
      storageConfiguration: {
        type: "OPENSEARCH_SERVERLESS",
        opensearchServerlessConfiguration: {
          collectionArn: props.collectionArn,
          vectorIndexName: props.indexName,
          fieldMapping: {
            vectorField: "vector",
            textField: "text",
            metadataField: "metadata"
          }
        }
      }
    });

    const ds = new bedrock.CfnDataSource(this, "KnowledgeBaseDataSource", {
      knowledgeBaseId: kb.attrKnowledgeBaseId,
      name: "kb-s3-datasource",
      dataSourceConfiguration: {
        type: "S3",
        s3Configuration: {
          bucketArn: props.bucket.bucketArn
        }
      }
    });

    this.knowledgeBaseId = kb.attrKnowledgeBaseId;

    new CfnOutput(this, "KnowledgeBaseId", { value: this.knowledgeBaseId });
    new CfnOutput(this, "DataSourceId", { value: ds.attrDataSourceId });
  }
}
