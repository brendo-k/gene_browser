import { Bb } from './bb';
import { Mrna } from './mrna';
import { DNA } from './dna';


export interface Gene extends DNA{
  gene_name: string;
  bb: Bb;
  mRNA: Mrna[];
}
