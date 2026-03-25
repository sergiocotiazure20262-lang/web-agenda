import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { Navbar } from '../../layout/navbar/navbar';
import { Sidebar } from '../../layout/sidebar/sidebar';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-consultar-tarefa',
  imports: [
    Navbar,
    Sidebar,
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './consultar-tarefa.html',
  styleUrl: './consultar-tarefa.css',
})
export class ConsultarTarefa {

  //Atributo para armazenar a listagem de tarefas
  tarefas = signal<any[]>([]);

  //HTTP CLIENT -> fazer a integração com a API
  private http = inject(HttpClient);

  //Formulário para filtrar as datas da pesquisa
  formulario = new FormGroup({
    dataMin: new FormControl('', [Validators.required]),
    dataMax: new FormControl('', [Validators.required]),
  });

  //Função executada ao abrir a página
  ngOnInit() {

    //Pegar a data atual
    const hoje = new Date();

    //Primeiro dia do mês
    const primeiroDia = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    //Ultimo dia do mês
    const ultimoDia = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
    //Formatando as datas para yyyy-MM-dd
    const formatarData = (data: Date) => {
      return data.toISOString().split('T')[0];
    }

    //Preencher o formulário com as datas do primeiro e ultimo dia do mês
    this.formulario.patchValue({
      dataMin: formatarData(primeiroDia),
      dataMax: formatarData(ultimoDia)
    });

    //Realizar a consulta
    this.consultar();
  }

  //Função para executar a consulta das tarefas
  consultar() {
    //Capturar as datas do formulário
    const dataMin = this.formulario.value.dataMin;
    const dataMax = this.formulario.value.dataMax;

    //Executar a consulta na API de tarefas
    this.http.get('http://localhost:8083/api/v1/tarefas/' + dataMin + "/" + dataMax)
      .subscribe((data) => {
        this.tarefas.set(data as any[]);
      });
  }

  //Função para excluir a tarefa
  excluir(id: string) {
    if (confirm('Deseja realmente excluir a tarefa selecionada?')) {
      this.http.delete('http://localhost:8083/api/v1/tarefas/' + id)
        .subscribe({
          next: (data: any) => {
            alert('Tarefa: ' + data.nome + ", excluída com sucesso!");
            this.consultar();
          },
          error: (e) => {
            console.log(e.error);
          }
        });
    }
  }
}
