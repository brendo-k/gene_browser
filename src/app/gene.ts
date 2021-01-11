import { Coord } from './coord';
import { Strand } from './strand.enum';
import { Bb } from './bb';


export interface Gene {
  chromosome_num: string;
  source: string;
  gene_name: string;
  start: number;
  end: number;
  strand: Strand;
  attributes: string[];
  bb: Bb;
}
