import { Strand } from './strand.enum';

export interface DNA {
  _id : string;
	chromosome_num : string;
	source : string;
	gene_name : string;
	start : number;
	end : number;
	score : string;
	strand : Strand;
	phase : string;
	attributes : string[];
}
