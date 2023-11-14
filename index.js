const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonStyle, ButtonBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const fs = require('fs');
const configsPath = './database/spoiler.json';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions
    ]
});

client.once('ready', () => {
    console.log('online');
});

client.on('messageCreate', msg => {
    if (msg.author.bot) {
        return;
    }
    if (msg.content == '!embed_spoiler') {
        const embed = new EmbedBuilder()
            .setDescription('embed para o spoiler')

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('CREATE_SPOILER')
                    .setLabel('Criar um spoiler')
                    .setStyle(ButtonStyle.Secondary)
            );

        msg.delete();
        msg.channel.send({ content: 'teste', embeds: [embed], components: [row] });
    }
});

client.on("interactionCreate", async (interaction) => {
    if (interaction.customId === 'CREATE_SPOILER') {
        const modal = new ModalBuilder()
            .setCustomId('SPOILER_MODAL')
            .setTitle('Criar spoiler');

        const msgInput = new TextInputBuilder()
            .setCustomId('spoiler_pergunta#1')
            .setLabel('Qual a mensagem do spoiler?')
            .setStyle(TextInputStyle.Paragraph);
        const msg2Input = new TextInputBuilder()
            .setCustomId('spoiler_pergunta#2')
            .setLabel('Qual a mensagem antes do spoiler?')
            .setStyle(TextInputStyle.Paragraph);
        const urlInput = new TextInputBuilder()
            .setCustomId('spoiler_pergunta#3')
            .setLabel('Link da print do spoiler:')
            .setStyle(TextInputStyle.Short);

        const primeiro = new ActionRowBuilder().addComponents(msgInput);
        const segundo = new ActionRowBuilder().addComponents(msg2Input);
        const terceiro = new ActionRowBuilder().addComponents(urlInput);

        modal.addComponents(primeiro, segundo, terceiro);

        interaction.showModal(modal)
    }

    if (interaction.customId === 'SHOW_SPOILER') {
        try {
            const data = JSON.parse(fs.readFileSync(configsPath, 'utf8'));
            // Verificar se o campo spoilers existe
            if (!data.spoilers) {
                console.error('Dados de spoiler não encontrados.');
                return;
            }

            const spoilerData = data.spoilers;
            const { participants } = spoilerData;

            // Verificar se o campo participants existe
            if (!participants) {
                console.error('Dados de participantes não encontrados.');
                return;
            }

            const embed = new EmbedBuilder()
                .setTitle('Título do spoiler')
                .setDescription(spoilerData.msg)
                .setImage(spoilerData.url);

            interaction.reply({ content: 'Spoiler:', embeds: [embed], ephemeral: true });

            let spoilersCounter = spoilerData.participants.length

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('SHOW_SPOILER')
                        .setLabel(`Ver spoiler: (${spoilersCounter})`)
                        .setStyle(ButtonStyle.Secondary)
                )


            // Atualiza o botão com a quantidade de interações
            try {
                interaction.message.edit({ components: [row] })
                console.log(spoilersCounter);
            } catch (error) {
                console.log('Não foi possível atualizar o botão agora.');
            }


            if (!participants.includes(interaction.user.id)) {
                participants.push(interaction.user.id);
            }

            fs.writeFile(configsPath, JSON.stringify(data, null, 2), (err) => {
                if (err) {
                    console.error('Erro ao escrever no arquivo spoiler.json:', err);
                } else {
                    console.log(`${interaction.user.username} está participando do sorteio.`);
                }
            });
        } catch (error) {
            console.error('Erro ao ler ou analisar o arquivo de configurações:', error);
        }
    }

    if (interaction.customId === 'SPOILER_MODAL') {
        const dados = JSON.parse(fs.readFileSync(configsPath, 'utf8'));

        const msg = interaction.fields.getTextInputValue('spoiler_pergunta#1');
        const msg2 = interaction.fields.getTextInputValue('spoiler_pergunta#2');
        const url = interaction.fields.getTextInputValue('spoiler_pergunta#3');

        // Armazenar os dados do spoiler no arquivo JSON
        dados.spoilers = {
            msg: msg,
            url: url,
            participants: []
        };

        fs.writeFile(configsPath, JSON.stringify(dados, null, 2), 'utf8', (err) => {
            if (err) {
                console.error('Erro ao escrever o arquivo de configurações:', err);
                return;
            }
        });

        const embed = new EmbedBuilder()
            .setTitle('Clique para ver o spoiler')
            .setDescription(msg2)

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('SHOW_SPOILER')
                    .setLabel('Ver spoiler')
                    .setStyle(ButtonStyle.Secondary)
            )
        interaction.reply({ content: 'Spoiler criado com sucesso.', ephemeral: true })
        interaction.channel.send({ content: 'Spoiler', embeds: [embed], components: [row] })
    }

});



client.login("seu_token_aqui");