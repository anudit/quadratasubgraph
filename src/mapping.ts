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

  entity.save()

}
