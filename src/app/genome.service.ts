import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Gene } from './gene';
import { Observable } from 'rxjs'
import { Strand } from './strand.enum';


@Injectable({
  providedIn: 'root'
})
export class GenomeService {


  constructor(private http: HttpClient) { 
  }

  //make http request to server to get genes in range
  get_genes(start: number, end: number, chromosome: string): Observable<Object>{
    console.log('getting genes from service');
    return this.http.get('api/gene', {params:{start: start.toString(),
                                              end: end.toString(), 
                                              chromosome: chromosome.toString()}});
  }

  //make http request to server for mRNA with a gene id 
  get_mRNA(gene: string, chromosome: string){
    return this.http.get('api/mRNA', {params:{gene: gene, chromosome: chromosome}});
  }

  get_exon(mRNA: string, chromosome: string){
    return this.http.get('api/exon', {params:{mRNA: mRNA, chromosome: chromosome}});
  }

  get_dna(start: number, end: number, chromosome: string): Observable<Object>{
    console.log('get dna');
    return this.http.get('api/dna', {
      params:{
        start: start.toString(),
        end: end.toString(), 
        chromosome: chromosome,
      },
    });
  }


  //chromosome_num: string;
  //source: string;
  //gene_name: string;
  //start: number;
  //end: number;
  //strand: Strand;
  //attributes: string[];

 // get_temp_genes(): Gene[] {
 //   return [
 //     {
 //       _id: "1",
 //       chromosome_num: "1",
 //       source: "test",
 //       gene_name: "gene_1",
 //       start: 1,
 //       end: 10000,
 //       strand: Strand.positive,
 //       attributes: [],
 //       bb: null,
 //       mRNA: null,
 //     },
 //     {
 //       _id: "2",
 //       chromosome_num: "1",
 //       source: "test",
 //       gene_name: "gene_1",
 //       start: 50000,
 //       end: 60000,
 //       strand: Strand.negative,
 //       attributes: [],
 //       bb: null,
 //       mRNA:null,
 //     },
 //     {
 //       _id: "3",
 //       chromosome_num: "1",
 //       source: "test",
 //       gene_name: "gene_1",
 //       start: 20000,
 //       end: 30000,
 //       strand: Strand.negative,
 //       attributes: [],
 //       bb: null,
 //       mRNA: null,
 //     },
 //   ]
 // }
    
};
