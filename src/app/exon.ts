import { Strand } from './strand.enum';
export interface Exon {
  _id : string;
	chromosome_num : string;
	source : string;
	start : number;
	end : number;
  exon_name: string;
	score : string;
	strand : Strand;
	phase : string;
	attributes : string[];
	mrna : string;
}
