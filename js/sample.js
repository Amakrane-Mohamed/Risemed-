const SAMPLE = {
  communities: [
    {
      id: "c-kasserine",
      name: "Kasserine workshop group",
      blurb: "People who meet at the youth centre and compare what they tried that month.",
      place: "Kasserine"
    },
    {
      id: "c-sidibouzid",
      name: "Sidi Bouzid project desk",
      blurb: "A table for half-built ideas: pricing, suppliers, and who to talk to next.",
      place: "Sidi Bouzid"
    },
    {
      id: "c-kitchens",
      name: "Food from home",
      blurb: "For anyone selling from a kitchen, a field, or a neighbour's shop.",
      place: "Inland towns"
    },
    {
      id: "c-readers",
      name: "Readers outside the big coast",
      blurb: "Investors and advisors who will read a project that isn't based in Tunis.",
      place: "Tunisia"
    },
    {
      id: "c-gafsa",
      name: "Gafsa repair bench",
      blurb: "Phones, pumps, small machines. People compare the part that failed and what they charged.",
      place: "Gafsa"
    },
    {
      id: "c-beja",
      name: "Béja first customers",
      blurb: "For the week you are trying to get five people to pay, not to perfect the name.",
      place: "Béja"
    }
  ],
  courses: [
    {
      id: "course-price",
      title: "Pricing a small service",
      language: "Arabic",
      level: "Starting",
      summary: "How to put a number on work when the town already knows you.",
      lessons: [
        {
          id: "ls-price-1",
          title: "The town already has a price in its head",
          body: "Before you invent a number, write down what people pay now for the closest thing. A haircut, a kilo of olives, a day's labour. Your price has to sit next to those, not next to a screenshot from another country."
        },
        {
          id: "ls-price-2",
          title: "Write it on paper first",
          body: "Put the price, what it includes, and what it doesn't on one page. If you can't say it out loud at the market, it isn't ready for a post."
        },
        {
          id: "ls-price-3",
          title: "Ask two people, then stop talking",
          body: "Ask what they pay now and who they trust. If they say you're high, ask what they're comparing you with. Don't drop the number in the same conversation."
        }
      ]
    },
    {
      id: "course-buyer",
      title: "The first conversation with a buyer",
      language: "French",
      level: "You've tried something",
      summary: "Asking for the order without a pitch deck.",
      lessons: [
        {
          id: "ls-buyer-1",
          title: "One sentence on what you made",
          body: "Say what it is, who it's for, and the price. Then wait. The silence is part of the conversation."
        },
        {
          id: "ls-buyer-2",
          title: "Bring the thing, not the slides",
          body: "A sample, a photo from the last market, or the page where you wrote the costs. People in a small town decide from the object and from whether you show up again."
        }
      ]
    },
    {
      id: "course-page",
      title: "The one page a reader can finish",
      language: "Arabic",
      level: "Starting",
      summary: "What the project is, who pays, and what you've already tried. One page.",
      lessons: [
        {
          id: "ls-page-1",
          title: "Start with the person who pays",
          body: "Name them the way you'd point at them in the street. 'Women who sell at the Tuesday market' is usable. 'Target users' is not."
        },
        {
          id: "ls-page-2",
          title: "One try, written honestly",
          body: "Write what you did, what it cost, and what the person said. If they didn't buy, write that. A reader can work with a no. They can't work with a blank."
        }
      ]
    },
    {
      id: "course-batch",
      title: "What a batch actually costs",
      language: "French",
      level: "You've tried something",
      summary: "Oil, jars, the bus, and the hours you pretend were free.",
      lessons: [
        {
          id: "ls-batch-1",
          title: "Write the hour down",
          body: "If the batch took you four hours, the cost includes four hours. Leaving it off makes the price look clever and the week impossible."
        },
        {
          id: "ls-batch-2",
          title: "The bus is part of the product",
          body: "A trip to the souk for jars, or a ride to the next town with the box on your lap, belongs on the page. So does the jar you broke."
        }
      ]
    }
  ],
  sessions: [
    {
      id: "ev-kasserine",
      title: "Saturday workshop",
      place: "Kasserine youth centre",
      when: "Saturday morning",
      detail: "Bring the project you're actually working on, even if it's one page."
    },
    {
      id: "ev-kef",
      title: "Office hour with a funder",
      place: "Le Kef, cultural centre",
      when: "One afternoon",
      detail: "Ten minutes on what you need the money for. No slides required."
    },
    {
      id: "ev-souk",
      title: "Market walk",
      place: "Sidi Bouzid, Tuesday market",
      when: "Morning, before the heat",
      detail: "Walk two stalls with someone who already sells, and write the price people are paying."
    },
    {
      id: "ev-gafsa",
      title: "What a batch costs",
      place: "Gafsa, a kitchen or a workshop",
      when: "A weekday afternoon",
      detail: "Oil, jars, the bus, and the hours. The number has to include the hours."
    },
    {
      id: "ev-kairouan",
      title: "Drafting table",
      place: "Kairouan",
      when: "An evening",
      detail: "Rewrite the project page in the language you think in. Arabic and French can sit on the same table."
    },
    {
      id: "ev-beja",
      title: "Reading circle",
      place: "Béja, or a call if the road is bad",
      when: "Once a month",
      detail: "Four project pages, read out loud. The writer stays quiet until the end."
    },
    {
      id: "ev-medenine",
      title: "First customers",
      place: "Medenine souk",
      when: "A market morning",
      detail: "You leave with names of people who asked a price, not with a poster."
    }
  ],
  threads: [
    {
      id: "th-buyers",
      title: "How do you find the first five buyers in a small town?",
      body: "Posters didn't do much for me. What actually worked: the shop on the corner, the Friday market, or something else?",
      example: true
    },
    {
      id: "th-language",
      title: "Which language do you write the project in?",
      body: "I think in Tunisian Arabic, I write French at school, and a funder asked for English. Curious what other people keep as the main version.",
      example: true
    }
  ],
  posts: [
    {
      id: "p-kasserine",
      kind: "community",
      communityId: "c-kasserine",
      body: "If you're coming Saturday, write one sentence on what you want help with. We'll start with those.",
      example: true
    },
    {
      id: "p-share",
      kind: "share",
      body: "I took the soap to the Tuesday market. Two people asked the price and I didn't have one. That's the next lesson.",
      example: true
    }
  ],
  offers: [
    {
      id: "of-proto",
      title: "Example: money for a first prototype",
      detail: "Up to 4,000 TND for a project outside Tunis, Sfax, and Sousse. You need a page on what the money buys, and one person in your town who has already tried the thing.",
      whoFor: "Youth with a project they've tested once",
      until: "Example, not an open call",
      example: true
    },
    {
      id: "of-hours",
      title: "Example: a monthly reading hour",
      detail: "An advisor reads four project pages a month and replies in Arabic or French. No travel.",
      whoFor: "Early projects that can be explained in one page",
      until: "Example, not a calendar booking",
      example: true
    }
  ]
};
