define(
  'ephox.robin.words.Cluster',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.polaris.api.Arrays',
    'ephox.robin.api.general.Zone',
    'ephox.robin.words.Clustering',
    'ephox.robin.words.Identify'
  ],

  function (Arr, Fun, Arrays, Zone, Clustering, Identify) {
    /**
     * Finds words in groups of text (each HTML text node can have multiple words).
     */
    var findWords = function (universe, cluster) {
      var groups = Arrays.splitby(cluster, function (c) {
        // I really don't think this can happen ... given that the cluster is specifically excluding these.
        var elem = c.item();
        return universe.property().isBoundary(elem) || universe.property().isEmptyTag(elem);
      });

      return Arr.bind(groups, function (x) {
        var text = Arr.map(x, function (y) {
          return y.text();
        }).join('');
        return Identify.words(text);
      });
    };

    /**
     * Searches for words within the element or that span the edge of the element.
     *
     * Returns the words found and the elements that contain the words (not split on word boundaries).
     */
    var generate = function (universe, element, optimise) {
      var cluster = Clustering.words(universe, element, optimise).all();
      var items = Arr.map(cluster, function (c) { return c.item(); });      
      var zone = Zone.constant(items);
      var words = findWords(universe, cluster);

      return {
        zone: Fun.constant(zone),
        words: Fun.constant(words)
      };
    };

    var empty = function () {
      return {
        zone: Zone.empty,
        words: Fun.constant([])
      };
    };

    return {
      generate: generate,
      empty: empty
    };
  }
);