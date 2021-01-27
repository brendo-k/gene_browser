import { Exon } from './exon';
import { DNA } from './dna';

export interface Mrna extends DNA{
	gene : string;
  exon: Exon[];
}
