test(
  'BoundedZoneTest',

  [
    'ephox.boss.api.Gene',
    'ephox.boss.api.TestUniverse',
    'ephox.boss.api.TextGene',
    'ephox.robin.api.general.ZonePosition',
    'ephox.robin.api.general.ZoneViewports',
    'ephox.robin.test.Arbitraries',
    'ephox.robin.test.PropertyAssertions',
    'ephox.robin.test.ZoneObjects',
    'ephox.robin.zone.TextZones',
    'global!Error'
  ],

  function (Gene, TestUniverse, TextGene, ZonePosition, ZoneViewports, Arbitraries, PropertyAssertions, ZoneObjects, TextZones, Error) {
    var check = function (universe, expected, id) {
      var item = universe.find(universe.get(), id).getOrDie();
      var actual = TextZones.fromBounded(universe, item, item, 'en', ZoneViewports.anything());
      ZoneObjects.assertZones('Starting from: ' + id, universe, expected, actual.zones());
    };

    var doc1 = TestUniverse(Gene('root', 'root', [
      Gene('div1', 'div', [
        Gene('p1', 'p', [
          TextGene('a', 'one'),
          Gene('image', 'img', [ ]),
          TextGene('b', 'tw'),
          TextGene('c', 'o')
        ]),
        Gene('p2', 'p', [
          TextGene('en-a', 'one'),
          Gene('image2', 'img', [ ]),
          TextGene('en-b', 'tw'),
          TextGene('en-c', 'o'),
          Gene('de', 'span', [
            TextGene('de-a', 'di'),
            TextGene('de-b', 'e'),

            // Two consecutive english spans, so all should be in the same section.
            Gene('en', 'span', [
              TextGene('en-d', 'but')
            ], {}, { lang: 'en' }),
            Gene('en2', 'span', [
              TextGene('en-e', 'ter')
            ], {}, { lang: 'en' }),
            TextGene('de-c', 'der Hund')
          ], {}, { lang: 'de' }),
          TextGene('en-f', 'anoth'),
          TextGene('en-g', 'er')
        ], { }, { lang: 'en' })
      ], {}, { lang: 'fr' })
    ]));

    check(doc1, [

      { lang: 'fr', elements: [ 'a' ], words: [ 'one' ] },
      { lang: 'fr', elements: [ 'b', 'c' ], words: [ 'two' ] },

      { lang: 'en', elements: [ 'en-a' ], words: [ 'one' ] },
      { lang: 'en', elements: [ 'en-b', 'en-c' ], words: [ 'two' ] },

      { lang: 'de', elements: [ 'de-a', 'de-b' ], words: [ 'die' ] },

      { lang: 'en', elements: [ 'en-d', 'en-e' ], words: [ 'butter' ] },

      { lang: 'de', elements: [ 'de-c' ], words: [ 'der', 'Hund' ] },

      { lang: 'en', elements: [ 'en-f', 'en-g' ], words: [ 'another' ] }

    ], 'div1');

    var doc2 = TestUniverse(Gene('root', 'root', [
      Gene('div1', 'div', [
        Gene('p1', 'p', [
          TextGene('en-a', 'one'),
          Gene('image2', 'img', [ ]),
          TextGene('en-b', 'tw'),
          TextGene('en-c', 'o'),
          Gene('de', 'span', [
            Gene('span-inline', 'span', [
              TextGene('de-a', 'di'),
              TextGene('de-b', 'e')
            ]),
            Gene('fr', 'span', [
              TextGene('fr-a', 'e')
            ], { }, { lang: 'fr' }),

            // The language should jump back to de.
            TextGene('de-c', 'und'),
            Gene('de2', 'span', [
              TextGene('de-c-1', 'inside')
            ], {}, { lang: 'de' }),
            Gene('en', 'span', [
              TextGene('en-d', 'but')
            ], {}, { lang: 'en' }),
            Gene('en2', 'span', [
              TextGene('en-e', 'ter')
            ], {}, { lang: 'en' }),
            // This text node is put in because of a limitation where we need an intervening text node to identify
            // language boundaries
            TextGene('de-d', '')
          ], {}, { lang: 'de' }),
          TextGene('en-f', 'anoth'),
          TextGene('en-g', 'er')
        ])
      ], {}, { lang: 'en' })
    ]));

    check(doc2, [

      { lang: 'en', elements: [ 'en-a' ], words: [ 'one' ] },
      { lang: 'en', elements: [ 'en-b', 'en-c' ], words: [ 'two' ] },
      { lang: 'de', elements: [ 'de-a', 'de-b' ], words: [ 'die' ] },
      { lang: 'fr', elements: [ 'fr-a' ], words: [ 'e' ] },
      { lang: 'de', elements: [ 'de-c', 'de-c-1' ], words: [ 'undinside' ] },
      { lang: 'en', elements: [ 'en-d', 'en-e' ], words: [ 'butter' ] },
      { lang: 'de', elements: [ 'de-d' ], words: [ ] },
      { lang: 'en', elements: [ 'en-f', 'en-g' ], words: [ 'another' ] }

    ], 'div1');


    PropertyAssertions.check('Checking any id ranges', [
      Arbitraries.arbRangeIds(doc1, doc1.property().isText)
    ], function (info) {
      var item1 = doc1.find(doc1.get(), info.startId).getOrDie();
      var item2 = doc1.find(doc1.get(), info.finishId).getOrDie();
      var actual = TextZones.fromBounded(doc1, item1, item2, 'en', ZoneViewports.anything());
      ZoneObjects.assertProps('Testing zones for ' + info.startId + '->' + info.finishId, doc1, actual.zones());
      return true;
    }, {

    });

  }
);