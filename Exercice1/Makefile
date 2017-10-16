CC= g++
CFLAGS= -c -Wall
LDFLAGS=
SOURCES= main.cpp IntegerArraySort.cpp
OBJECTS=$(SOURCES:.cpp=.o)
EXEC= prog

all: $(SOURCES) $(EXEC)

$(EXEC): $(OBJECTS)
	$(CC) $(LDFLAGS) $(OBJECTS) -o $@

.cpp.o:
	$(CC) $(CFLAGS) $< -o $@