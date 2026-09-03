/*
Required Notice: Copyright (C) 2026 José Elias Hermínio Mendes - Projeto Comic Organizer

Este software é licenciado sob a PolyForm Noncommercial License 1.0.0.
O uso, modificação e distribuição são permitidos apenas para fins NÃO COMERCIAIS.
Para ler a licença completa, veja o arquivo LICENSE.txt no diretório raiz.
*/

import { Component, OnInit } from '@angular/core';
import { LucidePlus, LucideChevronDown, LucideMoon, LucideSun } from '@lucide/angular';
import { ConversionStateService } from '../../../../services/conversion-state';
import { FileManagerService } from '../../../../services/file-manager';
import { ConversionType } from '../../../../models/conversion-type';
import { ComicEdition } from '../../../../models/comic-edition';
import { invoke, isTauri } from '@tauri-apps/api/core';
import { PlatformNoticeService } from '../../../../services/platform-notice';

@Component({
  selector: 'app-menu-bar-settings',
  imports: [LucidePlus, LucideChevronDown, LucideMoon, LucideSun],
  templateUrl: './menu-bar-settings.html',
  styleUrl: './menu-bar-settings.css',
})
export class MenuBarSettings implements OnInit {
  // Controla se o menu de conversao esta aberto e qual tema esta ativo.
  isActive = false;
  isDarkMode: boolean = true;

  constructor(
    private conversionStateService: ConversionStateService,
    private fileManager: FileManagerService,
    private platformNotice: PlatformNoticeService,
  ) {}

  async selectConversion(type: ConversionType): Promise<void> {
    // Recupera o fluxo atual para impedir trocas no meio do carregamento.
    const currentConversion = this.conversionStateService.getConversion();
    // Verifica se ja existe alguma edicao carregada na interface.
    const hasLoadedEditions = this.fileManager.fileEditions.length > 0;

    if (currentConversion && currentConversion !== type) {
      // Se o usuario ja escolheu um fluxo, nao permitimos trocar para outro.
      return;
    }

    if (type === 'cbz-to-cbr' && !isTauri()) {
      // Exportar para CBR depende do app desktop, entao avisamos no navegador.
      this.isActive = false;
      this.platformNotice.showCbrExportNotice();
      return;
    }

    // Abre o seletor de arquivos adequado ao fluxo escolhido.
    const paths = await this.fileManager.selectFiles(type);

    if (!paths.length) {
      // Se o usuario cancelou a selecao, restauramos o estado anterior quando preciso.
      this.resetConversionIfNeeded(currentConversion, hasLoadedEditions);
      return;
    }

    // Filtra apenas caminhos novos para evitar duplicar edicoes.
    const newPaths = this.fileManager.getNewSourcePaths(paths);

    if (!newPaths.length) {
      console.warn('Nenhum arquivo novo selecionado. Os arquivos já foram adicionados.');
      return;
    }

    console.log('📦 Arquivos selecionados:');
    newPaths.forEach((p) => console.log(p));

    let editions: ComicEdition[];

    if (isTauri()) {
      // No desktop, o backend Rust faz o processamento pesado dos arquivos.
      console.log('📤 Enviando paths para o backend Tauri...');
      try {
        const command = type === 'cbr-to-cbz' ? 'process_cbr_files' : 'process_cbz_files';
        editions = await invoke<ComicEdition[]>(command, {
          paths: newPaths,
        });
      } catch (error) {
        console.error('Erro ao processar arquivos no backend:', error);
        this.resetConversionIfNeeded(currentConversion, hasLoadedEditions);
        return;
      }
    } else {
      // No navegador, a extração precisa acontecer localmente com JavaScript.
      console.log('🌐 Criando edições e extraindo páginas no ambiente Web...');
      editions = await this.fileManager.createWebEditions(newPaths);
    }

    if (!editions?.length) {
      // Sem edições válidas, voltamos ao estado anterior quando for seguro.
      this.resetConversionIfNeeded(currentConversion, hasLoadedEditions);
      return;
    }

    if (!currentConversion) {
      // A primeira seleção define o fluxo do restante da sessão.
      this.conversionStateService.setConversion(type);
    }

    // Registra os caminhos e joga as edições novas para a lista principal.
    this.fileManager.addSourcePaths(newPaths);
    this.fileManager.loadEditionsFromBackend(editions);

    console.log('✅ Edições carregadas com sucesso');
  }

  get selectedConversion(): ConversionType | null {
    return this.conversionStateService.getConversion();
  }

  ngOnInit(): void {
    // Mantém o tema padrão escuro ao abrir a aplicação.
    document.body.classList.add('dark-mode');
  }

  changeTheme(): void {
    // Alterna entre tema claro e escuro no corpo da página.
    document.body.classList.toggle('dark-mode');
    this.isDarkMode = !this.isDarkMode;
  }

  private resetConversionIfNeeded(
    currentConversion: ConversionType | null,
    hasLoadedEditions: boolean,
  ): void {
    // Se nada foi carregado ainda, liberamos o usuário para escolher outro fluxo.
    if (!hasLoadedEditions && !currentConversion) {
      this.conversionStateService.clearConversion();
    }
  }
}
