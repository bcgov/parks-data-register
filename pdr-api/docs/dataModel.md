# Parks Data Register
## Data Model

The data model exists as `nosqlwWorkbenchDataModel.json` which is an AWS DynamoDB NoSQL Workbench JSON file. To view the data model, [install NoSQL Workbench](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/workbench.settingup.html) and import the file into the Data Modeler.

NoSQL Workbench provides a tool to see all of the attributes and facets of the main database tables and their GSIs. 

### Main Table - NameRegister
Main data table.
|**Attribute Name**|**Attribute Type**|**Description**|
|---|---|---|
|`pk`|String|DynamoDB Partition Key (orcs).|
|`sk`|String|DynamoDB Sort Key.|
|`createDate`|String|The ISODate string timestamp of when the data was created.|
|`updateDate`|String|The ISODate string timestamp of when the data was most recently updated.|
|`legalName`|String| The UTF-8 encoded legal name of the data. The 'source of truth' on what the name of the data is.|
|`displayName`|String|The display name that will be surfaced to represent the data, especially in cases where the `legalName` cannot be easily displayed.|
|`phoneticName`|String|A phonetic interpretation of the `legalName` that may make it easier to pronounce.|
|`status`|String|The status of the name data. Can be `established`, `historical` or `repealed`.|
|`audioClip`|String|A URL leading to an external source where the name data can be heard being pronounced.|
|`notes`|String|A string for administrative notes on the data.|
|`effectiveDate`|String|A calendar date when the current status of the name data came into effect.|
|`searchTerms`|String|A comma separated list of terms to help the search engine find the data.|
|`lastModifiedBy`|String|The IDIR email associated with the last user who edited the name data.|
|`type`|String|Type of name data, current can be either `protectedArea` or `site`.|
|`newLegalName`|String|For historical items, shows what the `legalName` changed to.|
|`newEffectiveDate`|String|For historical items, shows what the `effectiveDate` changed to.|
|`newStatus`|String|For historical items, shows what the `status` changed to.|
|`displayId`|String|Shows the ORCS of the name data padded to 4 numbers (shows leading zeros) for display purposes.|
|`legalNameChanged`|Boolean|A flag on historical items indicating if the `legalName` changed.|
|`statusChanged`|Boolean|A flag on historical items indicating if the `status` changed.|
|`sites`|List|A list of the sites within the protected area.|

### Audit Table - Audit
Table of audit trails whenever data is updated.
|**Attribute Name**|**Attribute Type**|**Description**|
|---|---|---|
|`pk`|String|DynamoDB Partition Key (IDIR email of user who made the change).|
|`sk`|String|DynamoDB Sort Key (ISODate).|
|`oldImage`|Object|A snapshot of the old data item.|
|`newImage`|Object|A snapshot of the new data item.|
|`gsipk`|String|DynamoDB Partition Key for GSI1.|
|`gsisk`|String|DynamoDB Sort Key for GSI1.|
|`operation`|String|DynamoDB Streams operation (ADD/REMOVE/MODIFY).|

