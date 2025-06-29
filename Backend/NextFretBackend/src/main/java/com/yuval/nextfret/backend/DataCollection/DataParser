import java.io.*;
import java.util.*;
import java.util.regex.*;

public class ChordProParser {

    public static class SongData {
        public String title;
        public String artist;
        public Set<String> chords;
        public String lyrics;

        public SongData(String title, String artist, Set<String> chords, String lyrics) {
            this.title = title;
            this.artist = artist;
            this.chords = chords;
            this.lyrics = lyrics;
        }
    }


    public static SongData parseFile(File file) throws IOException {
        BufferedReader reader = new BufferedReader(new FileReader(file));
        StringBuilder lyricsBuilder = new StringBuilder();
        String line;
        String title = file.getName().replace(".chopro", "");
        String artist = "Unknown Artist";
        Set<String> chords = new HashSet<>();

        // תבנית כללית לאקורדים (כולל D/F#, A/C# וכו')
        Pattern chordPattern = Pattern.compile("\\[([A-G][#b]?m?(aj)?[0-9]*(/[A-G][#b]?)?)\\]");

        // מיפוי של קיצורים לשמות שדות
        String[] titleKeys = {"title", "t", "ti"};
        String[] artistKeys = {"artist", "st", "a", "subtitle"};

        while ((line = reader.readLine()) != null) {
            line = line.trim();

            // זיהוי title
            for (String key : titleKeys) {
                if (line.toLowerCase().startsWith("{" + key.toLowerCase() + ":")) {
                    title = extractValue(line);
                    break;
                }
            }

            // זיהוי artist
            for (String key : artistKeys) {
                if (line.toLowerCase().startsWith("{" + key.toLowerCase() + ":")) {
                    artist = extractValue(line);
                    break;
                }
            }

            // חילוץ אקורדים
            Matcher matcher = chordPattern.matcher(line);
            while (matcher.find()) {
                chords.add(matcher.group(1));
            }
            lyricsBuilder.append(line).append("\n");
        }

        reader.close();
        return new SongData(title, artist, chords, lyricsBuilder.toString().trim());
    }

    // פונקציה שעוזרת לחלץ את הערך מתוך שורת ChordPro כמו {title: ...}
    private static String extractValue(String line) {
        int colonIndex = line.indexOf(':');
        int closeBrace = line.indexOf('}');
        if (colonIndex != -1 && closeBrace != -1 && closeBrace > colonIndex) {
            return line.substring(colonIndex + 1, closeBrace).trim();
        }
        return "";
    }


}
