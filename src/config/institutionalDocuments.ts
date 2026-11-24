import type { ColorTheme } from "./uiThemes";

export interface InstitutionalDocument {
  title: string;
  subtitle: string;
  description: string;
  tone: ColorTheme;
  icon: "shield" | "scales";
  pdfUrl: string;
  sourceUrl: string;
  publisher: string;
  portalDescription: string;
  guidance: string[];
}

export const institutionalDocuments = {
  lgpd: {
    title: "LGPD e proteção de dados",
    subtitle: "Lei nº 13.709, de 14 de agosto de 2018",
    description: "A Lei Geral de Proteção de Dados Pessoais orienta o tratamento de dados pessoais e a proteção da privacidade. Informações de saúde exigem cuidado especial por serem dados pessoais sensíveis.",
    tone: "blue",
    icon: "shield",
    pdfUrl: "https://www2.camara.leg.br/legin/fed/lei/2018/lei-13709-14-agosto-2018-787077-normaatualizada-pl.pdf",
    sourceUrl: "https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm",
    publisher: "Câmara dos Deputados — texto atualizado",
    portalDescription: "O Portal Incluir reúne informações de cadastro e de acompanhamento dos estudantes. Os menus são organizados por perfil de atuação. Ao utilizar essas informações, siga as orientações institucionais de proteção de dados.",
    guidance: [
      "Consulte e registre somente as informações necessárias ao acompanhamento do estudante.",
      "Trate dados de saúde, diagnósticos e contatos pessoais com cuidado. Não os compartilhe fora dos canais institucionais.",
      "Mantenha os registros corretos e procure a coordenação responsável quando precisar corrigir dados ou esclarecer seu uso.",
      "Ao terminar, saia da conta, especialmente em computadores compartilhados.",
    ],
  },
  legislacao: {
    title: "Legislação de acessibilidade e inclusão",
    subtitle: "Lei nº 13.146, de 6 de julho de 2015",
    description: "A Lei Brasileira de Inclusão da Pessoa com Deficiência reúne direitos e medidas para promover acessibilidade, participação e igualdade de oportunidades, incluindo o acesso à educação.",
    tone: "red",
    icon: "scales",
    pdfUrl: "https://www2.camara.leg.br/legin/fed/lei/2015/lei-13146-6-julho-2015-781174-normaatualizada-pl.pdf",
    sourceUrl: "https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13146.htm",
    publisher: "Câmara dos Deputados — texto atualizado",
    portalDescription: "O Portal Incluir apoia a organização do acompanhamento educacional e a comunicação entre os profissionais envolvidos. O sistema oferece recursos como navegação por teclado, ajustes de leitura e integração com o VLibras para auxiliar o acesso às informações.",
    guidance: [
      "Considere as necessidades individuais do estudante ao planejar o acompanhamento e as adaptações pedagógicas.",
      "Utilize os registros do portal para apoiar o trabalho conjunto da coordenação, dos professores e da equipe multidisciplinar.",
      "Use o botão de acessibilidade para ajustar a leitura e consulte o VLibras na lateral quando precisar de tradução automática em Libras.",
      "Em caso de dúvidas sobre procedimentos institucionais, procure a coordenação de acessibilidade e inclusão.",
    ],
  },
} satisfies Record<string, InstitutionalDocument>;
