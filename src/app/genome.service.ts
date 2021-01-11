import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Gene } from './gene';
import { Observable } from 'rxjs'
import { Strand } from './strand.enum';


@Injectable({
  providedIn: 'root'
})
export class GenomeService {


  constructor(private http: HttpClient) { 
  }

  get_genes(start: number, end: number, chromosome: string): Observable<Object>{
    let param = new HttpParams()
    param.append('start', start.toString())
    param.append('end', end.toString())
    param.append('chromosome', chromosome.toString())
    return this.http.get('api/gene', {params:{start: start.toString(),
                                              end: end.toString(), 
                                              chromosome: chromosome.toString()}})
  }

  //chromosome_num: string;
  //source: string;
  //gene_name: string;
  //start: number;
  //end: number;
  //strand: Strand;
  //attributes: string[];

  get_temp_genes(): Gene[] {
    return [
      {
        chromosome_num: "1",
        source: "test",
        gene_name: "gene_1",
        start: 1,
        end: 10000,
        strand: Strand.positive,
        attributes: [],
        bb: null,
      },
      {
        chromosome_num: "1",
        source: "test",
        gene_name: "gene_1",
        start: 50000,
        end: 60000,
        strand: Strand.negative,
        attributes: [],
        bb: null,
      },
      {
        chromosome_num: "1",
        source: "test",
        gene_name: "gene_1",
        start: 20000,
        end: 30000,
        strand: Strand.negative,
        attributes: [],
        bb: null,
      },
    ]
  }
    
};
