import {
  QuadPassport,
  TransferSingle
} from "../generated/QuadPassport/QuadPassport"
import { QuadrataPassport } from "../generated/schema"
import { ByteArray, BigInt, crypto } from '@graphprotocol/graph-ts'

function countryKeccakToCC(keccak: string): string{
  let arr = ['AD','AE','AF','AG','AI','AL','AM','AO','AQ','AR','AS','AT','AU','AW','AX','AZ','BA','BB','BD','BE','BF','BG','BH','BI','BJ','BL','BM','BN','BO','BQ','BR','BS','BT','BV','BW','BY','BZ','CA','CC','CD','CF','CG','CH','CI','CK','CL','CM','CN','CO','CR','CU','CV','CW','CX','CY','CZ','DE','DJ','DK','DM','DO','DZ','EC','EE','EG','EH','ER','ES','ET','FI','FJ','FK','FM','FO','FR','GA','GB','GD','GE','GF','GG','GH','GI','GL','GM','GN','GP','GQ','GR','GS','GT','GU','GW','GY','HK','HM','HN','HR','HT','HU','ID','IE','IL','IM','IN','IO','IQ','IR','IS','IT','JE','JM','JO','JP','KE','KG','KH','KI','KM','KN','KP','KR','KW','KY','KZ','LA','LB','LC','LI','LK','LR','LS','LT','LU','LV','LY','MA','MC','MD','ME','MF','MG','MH','MK','ML','MM','MN','MO','MP','MQ','MR','MS','MT','MU','MV','MW','MX','MY','MZ','NA','NC','NE','NF','NG','NI','NL','NO','NP','NR','NU','NZ','OM','PA','PE','PF','PG','PH','PK','PL','PM','PN','PR','PS','PT','PW','PY','QA','RE','RO','RS','RU','RW','SA','SB','SC','SD','SE','SG','SH','SI','SJ','SK','SL','SM','SN','SO','SR','SS','ST','SV','SX','SY','SZ','TC','TD','TF','TG','TH','TJ','TK','TL','TM','TN','TO','TR','TT','TV','TW','TZ','UA','UG','UM','US','UY','UZ','VA','VC','VE','VG','VI','VN','VU','WF','WS','YE','YT','ZA','ZM','ZW'];
  for (let index = 0; index < arr.length; index++) {
    const cc = arr[index];
    if (crypto.keccak256(ByteArray.fromUTF8(cc)).toHexString() == keccak) return cc;
  }
  return "00"
}

function amlToInt(aml: string): BigInt {
  for (let index = 1; index <= 10; index++) {
    if (aml == `0x${index.toString(16).padStart(64, '0')}`){
      return BigInt.fromI32(index);
    }
  }
  return BigInt.fromI32(0);
}

function isBusinessKeccackToBool(keccak: string): boolean {
  return crypto.keccak256(ByteArray.fromUTF8('TRUE')).toHexString() == keccak;
}

function getSlot(input:string, slot: number): string {
  return input.slice(10).slice(slot*64 as i32, (slot+1)*64 as i32 );
}

export function handleTransferSingle(event: TransferSingle): void {

  let id = event.transaction.from.toHexString().concat('-').concat(event.transaction.hash.toHexString());
  let entity = new QuadrataPassport(id);

  entity.tokenId = event.params.id;
  entity.owner = event.params.to;
  entity.operator = event.params.operator;
  entity.input = event.transaction.input;
  let QuadPassportContract = QuadPassport.bind(event.address);
  entity.tokenUri =  QuadPassportContract.uri(event.params.id);
  entity.timestamp = event.block.timestamp;

  entity.quadDID =  "0x".concat(getSlot(event.transaction.input.toHexString(),6));

  let amlRawData = "0x".concat(getSlot(event.transaction.input.toHexString(),15));
  entity.aml = amlToInt(amlRawData);

  let countryKeccak = "0x".concat(getSlot(event.transaction.input.toHexString(),16));
  entity.country = countryKeccakToCC(countryKeccak);

  entity.verifiedAt = "0x"+getSlot(event.transaction.input.toHexString(),8);
  entity.issuedAt = "0x"+getSlot(event.transaction.input.toHexString(),9);
  entity.fee = "0x"+getSlot(event.transaction.input.toHexString(),10);

  entity.save()

}
