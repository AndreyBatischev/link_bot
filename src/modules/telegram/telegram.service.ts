import { Injectable } from '@nestjs/common';
import { Markup, Telegraf } from 'telegraf';
import { LinksService } from '../links/links.service';
import { InjectBot } from 'nestjs-telegraf';
import * as validator from 'validator';

@Injectable()
export class TelegramService {
  private actionState: Record<number, string> = {};

  constructor(
    @InjectBot() private readonly bot: Telegraf,
    private readonly linksService: LinksService,
  ) {
    this.initializeBotCommands();
  }

  private initializeBotCommands() {
    this.bot.start(async (ctx) => {
      await ctx.reply(
        'Добро пожаловать! Выберите действие:',
        Markup.keyboard([
          ['Сохранить ссылку'],
          ['Список сохранённых ссылок'],
          ['Удалить ссылку', 'Получить ссылку'],
        ])
          .oneTime()
          .resize(),
      );
    });

    this.bot.hears('Сохранить ссылку', async (ctx) => {
      await ctx.reply(
        'Отправьте ссылку и ее название в формате: "ссылка" "имя"',
      );
    });

    this.bot.hears('Список сохранённых ссылок', async (ctx) => {
      try {
        const links = await this.linksService.getAllLinks();
        const response = links
          .map(
            (link, i) =>
              `${i + 1}. Код: ${link.uniqueCode},\n Название: ${link.linkName},\n Ссылка: ${link.url}`,
          )
          .join('\n');
        await ctx.reply(
          response || 'Ссылок нет.',
          Markup.inlineKeyboard([
            Markup.button.callback('Вернуться в меню', 'main_menu'),
          ]),
        );
      } catch (error) {
        ctx.reply('Ошибка при получении списка ссылок.');
      }
    });

    this.bot.hears('Получить ссылку', async (ctx) => {
      this.actionState[ctx.from.id] = 'get';
      await ctx.reply('Введите уникальный код ссылки для получения:');
    });

    this.bot.hears('Удалить ссылку', async (ctx) => {
      this.actionState[ctx.from.id] = 'delete';
      await ctx.reply('Введите уникальный код ссылки для удаления:');
    });

    this.bot.on('text', async (ctx) => {
      const message = ctx.message.text;

      const parts = message.split(' ');
      if (parts.length >= 2 && validator.isURL(parts[0])) {
        const url = parts[0];
        const linkName = parts.slice(1).join(' ');

        try {
          const uniqueCode = await this.linksService.saveLink({
            url,
            linkName,
          });
          await ctx.reply(
            `Ссылка сохранена. Уникальный код ссылки: ${uniqueCode}`,
            Markup.inlineKeyboard([
              Markup.button.callback('Вернуться в меню', 'main_menu'),
            ]),
          );
        } catch (error) {
          ctx.reply('Ошибка при сохранении ссылки.');
        }
        return;
      }

      if (this.actionState[ctx.from.id] === 'get') {
        try {
          const link = await this.linksService.getLinkByCode(message);
          await ctx.reply(
            `Ваша ссылка: ${link.url}`,
            Markup.inlineKeyboard([
              Markup.button.callback('Вернуться в меню', 'main_menu'),
            ]),
          );
        } catch (error) {
          ctx.reply('Ссылка не найдена.');
        } finally {
          delete this.actionState[ctx.from.id];
        }
        return;
      }

      if (this.actionState[ctx.from.id] === 'delete') {
        try {
          await this.linksService.deleteLink(message);
          await ctx.reply(
            'Ссылка успешно удалена.',
            Markup.inlineKeyboard([
              Markup.button.callback('Вернуться в меню', 'main_menu'),
            ]),
          );
        } catch (error) {
          ctx.reply('Ошибка при удалении ссылки.');
        } finally {
          delete this.actionState[ctx.from.id];
        }
        return;
      }

      ctx.reply('Некорректный формат данных. Попробуйте снова.');
    });

    this.bot.action('main_menu', async (ctx) => {
      await ctx.reply(
        'Выберите действие:',
        Markup.keyboard([
          ['Сохранить ссылку'],
          ['Список сохранённых ссылок'],
          ['Удалить ссылку', 'Получить ссылку'],
        ])
          .oneTime()
          .resize(),
      );
    });
  }
}
