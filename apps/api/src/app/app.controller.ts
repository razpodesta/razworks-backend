import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { aiAdapter } from '@razworks/ai'; // Importamos desde nuestra lib

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getData() {
    return this.appService.getData();
  }

  // --- NUEVO ENDPOINT DE PRUEBA DE INTEGRACIÓN ---
  @Post('test-ai')
  async testAi(@Body('prompt') prompt: string) {
    // Llamada directa al adaptador que acabamos de crear
    const response = await aiAdapter.generateText(prompt || 'Di: Sistema Operativo');
    return {
      ai_response: response,
      model_used: 'gemini-2.5-flash'
    };
  }
}
