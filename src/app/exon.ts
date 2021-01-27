import { Bb } from './bb';
import { DNA } from './dna';

export interface Exon extends DNA {
  exon_name: string;
	mrna : string;
  bb: Bb;
}
