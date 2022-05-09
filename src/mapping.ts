import {
  QuadPassport,
  TransferSingle
} from "../generated/QuadPassport/QuadPassport"
import { QuadrataPassport } from "../generated/schema"

export function handleTransferSingle(event: TransferSingle): void {

  let id = event.transaction.from.toHexString().concat('-').concat(event.params.id.toString());
  let entity = new QuadrataPassport(id);

  entity.tokenId = event.params.id;
  entity.owner = event.params.to;
  entity.operator = event.params.operator;
  let QuadPassportContract = QuadPassport.bind(event.address);
  entity.tokenUri =  QuadPassportContract.uri(event.params.id);
  entity.timestamp = event.block.timestamp;

  entity.quadDID =  "0x".concat(event.transaction.input.toHexString().slice(74, 74+64));
  entity.aml =  "0x".concat(event.transaction.input.toHexString().slice(74+64, 74+64+64));
  entity.country =  "0x".concat(event.transaction.input.toHexString().slice(74+64+64, 74+64+64+64));

  entity.save()

}
