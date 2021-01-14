import { Strand } from './strand.enum';

export interface Mrna {
  _id : string;
	chromosome_num : string;
	source : string;
	start : number;
	end : number;
	score : string;
	strand : Strand;
	phase : string;
	attributes : string[];
	gene : string;
}
