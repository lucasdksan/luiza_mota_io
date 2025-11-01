 # Evidências

 Lista das evidências que não foi possível implementar conforme o design/Figma. Mantive o conteúdo original e organizei em seções para facilitar leitura e acompanhamento.

 ---

 ## Print01 — Botão no local errado
 Não é possível aplicar o estilo solicitado porque o botão está em um bloco separado: ele está no header enquanto o Figma exige que o botão esteja dentro do main. Por isso não foi possível replicar o layout exatamente.

 ## Print02 — Fundo compartilhado entre seções
 Não é possível aplicar o fundo conforme o Figma porque ele usa a mesma classe da seção "Adicionar endereço", o que faria o estilo se duplicar em ambos os lugares. Observação: o mesmo problema acontece na seção "Pedidos".

 ## Print03 — Classes compartilhadas nos botões
 Os botões utilizam classes em comum entre seções. Se alterarmos texto ou cores globalmente, essas mudanças vão impactar outras seções (por exemplo, a seção "Endereço"). Por esse motivo evitei alterações que afetem outras áreas.

 ## Print04 — Sessão de Cartão é um iframe
 A área de "Cartão" é carregada via iframe, portanto não é possível estilizar seu conteúdo a partir do CSS do projeto (restrição do iframe/DOM externo).

 ## Print05 — Limitação na seção de Pedidos
 Na seção "Pedidos" foi possível estilizar apenas o estado de produto cancelado. Para estilizar os demais status precisamos de acesso ao ambiente (ex.: permissão de Call Center) ou de exemplos com esses estados renderizados.

 




